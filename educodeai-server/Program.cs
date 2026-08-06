using System.Security.Claims;
using System.Text;
using educodeai_server.Config;
using educodeai_server.Data;
using educodeai_server.Helpers;
using educodeai_server.Repository.Implementation;
using educodeai_server.Repository.Interface;
using educodeai_server.Services;
using educodeai_server.Services.Implement;
using educodeai_server.Services.Implementation;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using CloudinaryDotNet;
using Google.Cloud.Speech.V1;
using Google.Cloud.Storage.V1;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;
using educodeai_server.Hubs;
using educodeai_server.Workers;
using FFMpegCore;
using educodeai_server.Services.RefreshTokens;
using educodeai_server.Services.Security;

var builder = WebApplication.CreateBuilder(args);

// Configure FFMpegCore to use ffmpeg from project directory
var ffmpegPath = Path.Combine(AppContext.BaseDirectory, "ffmpeg");
GlobalFFOptions.Configure(options =>
{
    options.BinaryFolder = ffmpegPath;
    options.TemporaryFilesFolder = Path.GetTempPath();
});
Console.WriteLine($"FFMpegCore configured to use ffmpeg from: {ffmpegPath}");

// ==========================================
// THÊM: ĐĂNG KÝ SIGNALR
// ==========================================
builder.Services.AddSignalR();

// ==========================================
// 2. CẤU HÌNH XÁC THỰC (JWT)
// ==========================================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured."))),
            RoleClaimType = ClaimTypes.Role,
            ClockSkew = TimeSpan.FromMinutes(1)
        };

        // Trả envelope ổn định { success, message, error:{ code } } cho 401/403 để
        // frontend xử lý theo error.code thay vì body rỗng mặc định (J.5).
        options.Events = new JwtBearerEvents
        {
            // SignalR chuẩn: WebSocket/SSE không gửi được Authorization header nên client
            // truyền access token qua query "access_token". Chỉ đọc cho path hub session
            // (kết nối chạy trên HTTPS/WSS). Các request HTTP khác vẫn dùng header như cũ.
            OnMessageReceived = messageContext =>
            {
                var accessToken = messageContext.Request.Query["access_token"];
                var path = messageContext.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/sessionHub"))
                {
                    messageContext.Token = accessToken;
                }
                return Task.CompletedTask;
            },
            OnChallenge = async challengeContext =>
            {
                challengeContext.HandleResponse();
                if (challengeContext.Response.HasStarted)
                {
                    return;
                }

                challengeContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
                challengeContext.Response.ContentType = "application/json";
                await challengeContext.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Bạn cần đăng nhập để truy cập.",
                    error = new { code = "AUTHENTICATION_FAILED", message = "Bạn cần đăng nhập để truy cập." }
                });
            },
            OnForbidden = async forbiddenContext =>
            {
                if (forbiddenContext.Response.HasStarted)
                {
                    return;
                }

                forbiddenContext.Response.StatusCode = StatusCodes.Status403Forbidden;
                forbiddenContext.Response.ContentType = "application/json";
                await forbiddenContext.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Bạn không có quyền thực hiện thao tác này.",
                    error = new { code = "FORBIDDEN", message = "Bạn không có quyền thực hiện thao tác này." }
                });
            }
        };
    });

// ==========================================
// 3. CẤU HÌNH KẾT NỐI CƠ SỞ DỮ LIỆU
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<EduCodeAIDbContext>(options =>
    options.UseNpgsql(connectionString, sqlOptions =>
    {
        // Tự động thử lại khi gặp lỗi kết nối gián đoạn (như lỗi DNS 'No such host is known' khi treo lâu)
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null);
    }));

try
{
    var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
    var isRedisActive = builder.Configuration.GetValue<bool>("RedisConfig:IsActive", true);

    if (isRedisActive && !string.IsNullOrEmpty(redisConnectionString))
    {
        var configOptions = ConfigurationOptions.Parse(redisConnectionString);
        configOptions.AbortOnConnectFail = false;
        configOptions.ConnectTimeout = 2000;
        configOptions.SyncTimeout = 2000;
        configOptions.ReconnectRetryPolicy = new ExponentialRetry(500);

        var redis = ConnectionMultiplexer.Connect(configOptions);
        // 🔥 Check trạng thái ngay lúc start
        if (redis.IsConnected)
        {
            Console.WriteLine("Redis CONNECTED successfully");
        }
        else
        {
            Console.WriteLine("Redis NOT connected at startup (will retry...)");
        }

        builder.Services.AddSingleton<IConnectionMultiplexer>(redis);
        builder.Services.AddScoped<IRedisService, RedisService>();

        // Đăng ký Distributed Cache cho Redis
        builder.Services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnectionString;
            options.ConfigurationOptions = configOptions;
        });
    }
    else
    {
        var reason = !isRedisActive ? "turned OFF in appsettings" : "empty connection string";
        Console.WriteLine($"Redis is {reason} – using MemoryCache fallback");
        builder.Services.AddScoped<IRedisService, FallbackRedisService>();

        // Đăng ký Distributed Memory Cache khi Redis không khả dụng
        builder.Services.AddDistributedMemoryCache();
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Redis setup failed, using MemoryCache fallback: {ex.Message}");
    builder.Services.AddScoped<IRedisService, FallbackRedisService>();

    // Đăng ký Distributed Memory Cache khi Redis fail
    builder.Services.AddDistributedMemoryCache();
}


// ==========================================
// 4. ĐĂNG KÝ DEPENDENCY INJECTION (DI)
// ==========================================
builder.Services.AddHttpContextAccessor();
// Thêm bộ nhớ tạm để lưu OTP mà không cần dùng Database
builder.Services.AddMemoryCache();
builder.Services.AddDataProtection();
// Dịch vụ Xác thực và Captcha mới
builder.Services.AddHttpClient<ICaptchaService, CaptchaService>();
builder.Services.AddScoped<IXacThucService, XacThucService>();
builder.Services.AddScoped<ITokenService, TokenService>();
// Cache trạng thái user/session cho hot-path middleware (G.1); chạy trên IDistributedCache (Redis/memory fallback).
builder.Services.AddScoped<ISessionStateCache, SessionStateCache>();
// Publish event realtime tới SessionHub (G.8).
builder.Services.AddScoped<ISessionRealtimeNotifier, SessionRealtimeNotifier>();
// OTP service dùng chung (D.1): CSPRNG + hash + single-use + max attempts, backing store IDistributedCache.
builder.Services.AddScoped<IOtpService, OtpService>();
// Rate-limit phát/verify OTP theo purpose + identifier + IP (D.3); fail-open khi cache lỗi.
builder.Services.AddScoped<IOtpRateLimiter, OtpRateLimiter>();
builder.Services.Configure<RefreshTokenCleanupOptions>(builder.Configuration.GetSection("RefreshTokenCleanup"));
builder.Services.AddSingleton<RefreshTokenCleanupService>();
builder.Services.AddHostedService<RefreshTokenCleanupWorker>();
builder.Services.Configure<RequestOriginOptions>(builder.Configuration.GetSection("Security:RequestOrigin"));
builder.Services.AddSingleton<IValidateOptions<RequestOriginOptions>, RequestOriginOptionsValidator>();
builder.Services.AddOptions<RequestOriginOptions>().ValidateOnStart();
builder.Services.Configure<RefreshCookieOptions>(builder.Configuration.GetSection("Security:RefreshCookie"));
builder.Services.Configure<TrustedProxyOptions>(options =>
    options.Proxies = builder.Configuration.GetSection("Security:TrustedProxies").Get<string[]>() ?? []);
builder.Services.AddSingleton<IValidateOptions<TrustedProxyOptions>, TrustedProxyOptionsValidator>();
builder.Services.AddOptions<TrustedProxyOptions>().ValidateOnStart();
builder.Services.AddSingleton<IRequestOriginValidator, RequestOriginValidator>();
// Khóa học & Bài tập
builder.Services.AddScoped<IKhamPhaLoTrinhService, KhamPhaLoTrinhService>();
builder.Services.AddScoped<IKhoaHocRepository, KhoaHocRepository>();
builder.Services.AddScoped<IKhoaHocService, KhoaHocService>();
builder.Services.AddScoped<IThanhToanKhoaHocService, ThanhToanKhoaHocService>();
builder.Services.AddScoped<IMaGiamGiaService, MaGiamGiaService>();
builder.Services.AddScoped<IQuaTangKhoaHocService, QuaTangKhoaHocService>();
builder.Services.AddScoped<IPhongVanAIDocLapService, PhongVanAIDocLapService>();
builder.Services.AddScoped<IThanhToanEmailService, ThanhToanEmailService>();
builder.Services.AddScoped<IRutTienGiangVienEmailService, RutTienGiangVienEmailService>();
builder.Services.AddScoped<IRutTienGiangVienService, RutTienGiangVienService>();
builder.Services.AddScoped<INapTienAIService, NapTienAIService>();
builder.Services.AddScoped<IBaiTapRepository, BaiTapRepository>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IBaiTapThucHanhService, BaiTapThucHanhService>();
builder.Services.AddScoped<BaiTapThucHanhHocVienService>();
builder.Services.AddHttpClient<BaiTapService>();

// Người dùng & Thống kê

builder.Services.AddScoped<INguoiDungRepository, NguoiDungRepository>();
builder.Services.AddScoped<INguoiDungService, NguoiDungService>();
builder.Services.AddScoped<IHocVienService, HocVienService>();
builder.Services.AddScoped<IKhongGianHocTapService, KhongGianHocTapService>();
builder.Services.AddScoped<IThuThachService, ThuThachService>();
builder.Services.AddScoped<IThongKeHocTapService, ThongKeHocTapService>();
builder.Services.AddScoped<IThongKeAdminService, ThongKeAdminService>();

// AI & Lộ trình
builder.Services.AddScoped<IKhoaHocCuaToiRepository, KhoaHocCuaToiRepository>();
builder.Services.AddScoped<IKhoaHocCuaToiService, KhoaHocCuaToiService>();
builder.Services.AddScoped<IQuanLyNguoiDungRepository, QuanLyNguoiDungRepository>();
builder.Services.AddScoped<IQuanLyNguoiDungService, QuanLyNguoiDungService>();
builder.Services.AddScoped<IQuanLyHocVienService,QuanLyHocVienService>();
builder.Services.AddSingleton<LopHocEmailQueue>();
builder.Services.AddHostedService<LopHocEmailWorker>();
builder.Services.AddScoped<IQuanLyHocVienKhoaHocService, QuanLyHocVienKhoaHocService>();
builder.Services.AddScoped<IQuanLyDanhGiaService, QuanLyDanhGiaService>();
builder.Services.AddScoped<ILoTrinhAIGvRepository, LoTrinhAIGvRepository>();
builder.Services.AddScoped<IQuanLyHoSoGiangVienService, QuanLyHoSoGiangVienService>();
builder.Services.AddScoped<ILoTrinhAIGvService, LoTrinhAIGvService>();
// C. Cấu hình CORS (Cho phép React/Giao diện gọi API)
builder.Services.AddScoped<ILoTrinhAIRepository, LoTrinhAIRepository>();
builder.Services.AddScoped<ILoTrinhAIService, LoTrinhAIService>();
builder.Services.AddScoped<IChatBotAIService, ChatBotAIService>();
builder.Services.AddScoped<IKeyApiRepository, KeyApiRepository>();
builder.Services.AddScoped<IKeyApiService, KeyApiService>();
builder.Services.AddScoped<ISinhDoAnAIService, SinhDoAnAIService>();
builder.Services.AddScoped<IChamDiemDoAnService, ChamDiemDoAnService>();
builder.Services.AddScoped<IRateLimitService, RateLimitService>();
builder.Services.AddScoped<IMediaService, MediaService>();
// Singleton: TesseractEngine/tessdata nạp tốn kém, chỉ nên khởi tạo 1 lần cho cả vòng đời app.
builder.Services.AddSingleton<IGiayToScanningService, GiayToScanningService>();
builder.Services.AddTransient<IAiSubtitleWorker, AiSubtitleWorker>();
builder.Services.AddHostedService<educodeai_server.Services.Implementation.StaleHoldCleanupService>();
builder.Services.AddHostedService<educodeai_server.Services.Implementation.OrphanVideoCleanupService>();


// ==========================================
// 5. CẤU HÌNH HTTP CLIENT CHO GEMINI (ĐÃ TỐI ƯU)
// ==========================================
builder.Services.AddHttpClient<IGeminiAIService, GeminiAIService>((sp, client) =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var baseUrl = config["GeminiAI:BaseUrl"];

    if (!string.IsNullOrEmpty(baseUrl))
    {
        client.BaseAddress = new Uri(baseUrl);
    }
});


builder.Services.AddHttpClient<IGeminiToolCallingService, GeminiToolCallingService>((sp, client) =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var baseUrl = config["GeminiAI:BaseUrl"];

    if (!string.IsNullOrEmpty(baseUrl))
    {
        client.BaseAddress = new Uri(baseUrl);
    }
});

// Currency Exchange Service
builder.Services.AddHttpClient<ICurrencyExchangeService, CurrencyExchangeService>();

builder.Services.Configure<GeminiAIOptions>(builder.Configuration.GetSection("GeminiAI"));
builder.Services.Configure<PaymentMailOptions>(builder.Configuration.GetSection("PaymentMail"));

// Cloudinary Configuration
builder.Services.Configure<CauHinhCloudinary>(builder.Configuration.GetSection("Cloudinary"));

// Google Cloud Configuration
builder.Services.Configure<CauHinhGoogleCloud>(builder.Configuration.GetSection("GoogleCloud"));

// Currency Exchange Configuration
builder.Services.Configure<CurrencyExchangeConfig>(builder.Configuration.GetSection("CurrencyExchange"));

// Set GOOGLE_APPLICATION_CREDENTIALS env var + register SpeechClient singleton
var gcpConfig = builder.Configuration.GetSection("GoogleCloud").Get<CauHinhGoogleCloud>();
if (gcpConfig != null && !string.IsNullOrEmpty(gcpConfig.ServiceAccountJsonPath))
{
    var fullPath = Path.Combine(AppContext.BaseDirectory, gcpConfig.ServiceAccountJsonPath);
    if (!File.Exists(fullPath))
    {
        fullPath = Path.Combine(Directory.GetCurrentDirectory(), gcpConfig.ServiceAccountJsonPath);
    }
    if (File.Exists(fullPath))
    {
        Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", fullPath);
        Console.WriteLine($"GOOGLE_APPLICATION_CREDENTIALS set to: {fullPath}");
    }
}
builder.Services.AddSingleton(_ => SpeechClient.Create());
builder.Services.AddSingleton(_ => StorageClient.Create());
var cloudinarySettings = builder.Configuration.GetSection("Cloudinary").Get<CauHinhCloudinary>();
if (cloudinarySettings != null)
{
    var account = new Account(
        cloudinarySettings.CloudName,
        cloudinarySettings.ApiKey,
        cloudinarySettings.ApiSecret);
    var cloudinary = new Cloudinary(account);
    builder.Services.AddSingleton(cloudinary);
}


// YouTube Service
builder.Services.AddHttpClient<IYouTubeService, YouTubeService>();

// ==========================================
// 6. CẤU HÌNH CORS & SWAGGER
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Security:RequestOrigin:AllowedOrigins").Get<string[]>() ?? [];
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;
    var proxies = builder.Configuration.GetSection("Security:TrustedProxies").Get<string[]>() ?? [];
    foreach (var proxy in proxies)
    {
        if (System.Net.IPAddress.TryParse(proxy, out var address)) options.KnownProxies.Add(address);
    }
});

// ==========================================
// RATE LIMITING: bảo vệ endpoint quét CCCD (OCR tốn CPU + tải file ngoài)
// khỏi bị lạm dụng gây cạn tài nguyên. Giới hạn theo IP.
// ==========================================
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("RemoteLogoutOtpSend", httpContext => CreateRemoteLogoutLimiter(httpContext, 3));
    options.AddPolicy("RemoteLogoutOtpVerify", httpContext => CreateRemoteLogoutLimiter(httpContext, 10));
    options.AddPolicy("QuetGiayToPolicy", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ip,
            factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            });
    });
});

static System.Threading.RateLimiting.RateLimitPartition<string> CreateRemoteLogoutLimiter(HttpContext context, int permitLimit)
{
    var userId = context.User.FindFirst("id")?.Value ?? "anonymous";
    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    var partition = $"{userId}:{ip}";
    return System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
        partition,
        _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
        {
            PermitLimit = permitLimit,
            Window = TimeSpan.FromMinutes(5),
            QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "EduCodeAI API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,  
        Description = "Nhập theo format: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Khởi tạo dữ liệu nền của module thử thách nếu môi trường hiện tại còn thiếu.
// Initializer chỉ thêm theo MaCode, không ghi đè cấu hình nhiệm vụ/danh hiệu đã tồn tại.
await ThuThachDataInitializer.InitializeAsync(app.Services);

// Khởi tạo cấu hình cho EmailHelper để có thể đọc appsettings.json
educodeai_server.Helpers.EmailHelper.Initialize(app.Configuration);

// Tự vá các cột/bảng mới của phase gift-code để tránh lỗi 500 khi DB chưa chạy migration kịp.
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
    if (string.Equals(db.Database.ProviderName, "Npgsql.EntityFrameworkCore.PostgreSQL", StringComparison.Ordinal))
    {
        db.Database.ExecuteSqlRaw(
            """
            ALTER TABLE "DonHangKhoaHocs"
            ADD COLUMN IF NOT EXISTS "LoaiDonHang" character varying(30) NOT NULL DEFAULT 'COURSE_PURCHASE';
            """);

        db.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "MaQuaTangHocViens" (
                "MaQuaTang" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                "Code" character varying(40) NOT NULL,
                "MaDonHang" integer NOT NULL,
                "MaKhoaHoc" integer NOT NULL,
                "MaNguoiTang" integer NOT NULL,
                "MaNguoiNhan" integer NULL,
                "TrangThai" character varying(30) NOT NULL,
                "CreatedAt" timestamp with time zone NOT NULL,
                "ActivatedAt" timestamp with time zone NULL,
                "RedeemedAt" timestamp with time zone NULL,
                "ExpiredAt" timestamp with time zone NULL
            );
            """);

        db.Database.ExecuteSqlRaw(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_MaQuaTangHocViens_DonHangKhoaHocs_MaDonHang'
                ) THEN
                    ALTER TABLE "MaQuaTangHocViens"
                    ADD CONSTRAINT "FK_MaQuaTangHocViens_DonHangKhoaHocs_MaDonHang"
                    FOREIGN KEY ("MaDonHang") REFERENCES "DonHangKhoaHocs" ("MaDonHang") ON DELETE CASCADE;
                END IF;
            END
            $$;
            """);

        db.Database.ExecuteSqlRaw(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_MaQuaTangHocViens_Code" ON "MaQuaTangHocViens" ("Code");
            CREATE INDEX IF NOT EXISTS "IX_MaQuaTangHocViens_MaDonHang" ON "MaQuaTangHocViens" ("MaDonHang");
            CREATE INDEX IF NOT EXISTS "IX_MaQuaTangHocViens_MaKhoaHoc" ON "MaQuaTangHocViens" ("MaKhoaHoc");
            CREATE INDEX IF NOT EXISTS "IX_MaQuaTangHocViens_MaNguoiNhan" ON "MaQuaTangHocViens" ("MaNguoiNhan");
            CREATE INDEX IF NOT EXISTS "IX_MaQuaTangHocViens_MaNguoiTang_TrangThai_CreatedAt"
                ON "MaQuaTangHocViens" ("MaNguoiTang", "TrangThai", "CreatedAt");
            """);

        db.Database.ExecuteSqlRaw("""ALTER TABLE "DonHangKhoaHocs" ADD COLUMN IF NOT EXISTS "TongTienGoc" numeric(18,2) NOT NULL DEFAULT 0;""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "DonHangKhoaHocs" ADD COLUMN IF NOT EXISTS "SoTienGiam" numeric(18,2) NOT NULL DEFAULT 0;""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "DonHangKhoaHocs" ADD COLUMN IF NOT EXISTS "MaVoucher" integer NULL;""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "DonHangKhoaHocs" ADD COLUMN IF NOT EXISTS "CodeVoucher" character varying(40) NULL;""");
        db.Database.ExecuteSqlRaw("""UPDATE "DonHangKhoaHocs" SET "TongTienGoc" = "TongTien" WHERE "TongTienGoc" = 0;""");

        db.Database.ExecuteSqlRaw("""ALTER TABLE "MaGiamGias" ADD COLUMN IF NOT EXISTS "MaNguoiTao" integer NOT NULL DEFAULT 1;""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "MaGiamGias" ADD COLUMN IF NOT EXISTS "LoaiNguoiTao" character varying(20) NOT NULL DEFAULT 'ADMIN';""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "MaGiamGias" ADD COLUMN IF NOT EXISTS "PhamViApDung" character varying(30) NOT NULL DEFAULT 'SPECIFIC_COURSES';""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "MaGiamGias" ADD COLUMN IF NOT EXISTS "ChoPhepApDungChoQuaTang" boolean NOT NULL DEFAULT TRUE;""");

        db.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "MaGiamGiaKhoaHocs" (
                "MaLienKet" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                "MaVoucher" integer NOT NULL,
                "MaKhoaHoc" integer NOT NULL
            );
            """);
        db.Database.ExecuteSqlRaw("""CREATE UNIQUE INDEX IF NOT EXISTS "IX_MaGiamGiaKhoaHocs_MaVoucher_MaKhoaHoc" ON "MaGiamGiaKhoaHocs" ("MaVoucher", "MaKhoaHoc");""");
        db.Database.ExecuteSqlRaw("""CREATE INDEX IF NOT EXISTS "IX_MaGiamGiaKhoaHocs_MaKhoaHoc" ON "MaGiamGiaKhoaHocs" ("MaKhoaHoc");""");
        db.Database.ExecuteSqlRaw("""CREATE INDEX IF NOT EXISTS "IX_DonHangKhoaHocs_MaVoucher" ON "DonHangKhoaHocs" ("MaVoucher");""");
        db.Database.ExecuteSqlRaw("""CREATE INDEX IF NOT EXISTS "IX_MaGiamGias_MaNguoiTao" ON "MaGiamGias" ("MaNguoiTao");""");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Schema bootstrap (gift-code) bỏ qua: {ex.Message}");
}

// === SELF-HEALING: cột video/phụ đề + bảng phụ trợ của phase upload video cloud ===
// Khối này không tạo schema auth; RefreshToken đã thuộc EF migration.
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
    if (string.Equals(db.Database.ProviderName, "Npgsql.EntityFrameworkCore.PostgreSQL", StringComparison.Ordinal))
    {
        DatabaseSchemaSync.ApplyAsync(db).GetAwaiter().GetResult();
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Schema sync (legacy/domain) bỏ qua: {ex.Message}");
}

// PostgreSQL: seed InsertData gán PK cố định; cột identity dùng pg_get_identity_sequence (serial_sequence thường NULL).
// Nếu setval không chạy → trùng PK → 500 khi tạo mã QR.
//try
//{
//    using var scope = app.Services.CreateScope();
//    var db = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
//    if (string.Equals(db.Database.ProviderName, "Npgsql.EntityFrameworkCore.PostgreSQL", StringComparison.Ordinal))
//    {
//        var bangVaCot = new[]
//        {
//            ("DonHangKhoaHocs", "MaDonHang"),
//            ("ChiTietDonHangs", "MaChiTiet"),
//            ("GiaoDichThanhToans", "MaGiaoDich"),
//            ("DoanhThuGiangViens", "MaDoanhThu"),
//            ("MaGiamGias", "MaVoucher"),
//        };
//        foreach (var (bang, cot) in bangVaCot)
//        {
//            try
//            {
//                db.Database.ExecuteSqlRaw(
//                    $"""
//                    SELECT setval(
//                        COALESCE(
//                            pg_get_identity_sequence('""{bang}""', '{cot}'),
//                            pg_get_serial_sequence('""{bang}""', '{cot}')
//                        ),
//                        COALESCE((SELECT MAX(""{cot}"") FROM ""{bang}""), 0),
//                        true
//                    );
//                    """);
//            }
//            catch (Exception ex)
//            {
//                Console.WriteLine($"Seed sync setval for {bang}.{cot} bỏ qua: {ex.Message}");
//            }
//        }
//    }
//}
//catch (Exception ex)
//{
//    Console.WriteLine($"Seed sync bỏ qua: {ex.Message}");
//}

// PostgreSQL: seed InsertData gán PK cố định; cột identity dùng pg_get_identity_sequence (serial_sequence thường NULL).
// Nếu setval không chạy → trùng PK → 500 khi tạo mã QR.
//try
//{
//    using var scope = app.Services.CreateScope();
//    var db = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
//    if (string.Equals(db.Database.ProviderName, "Npgsql.EntityFrameworkCore.PostgreSQL", StringComparison.Ordinal))
//    {
//        var bangVaCot = new[]
//        {
//            ("DonHangKhoaHocs", "MaDonHang"),
//            ("ChiTietDonHangs", "MaChiTiet"),
//            ("GiaoDichThanhToans", "MaGiaoDich"),
//            ("DoanhThuGiangViens", "MaDoanhThu"),
//            ("MaGiamGias", "MaVoucher"),
//        };
//        foreach (var (bang, cot) in bangVaCot)
//        {
//            try
//            {
//                db.Database.ExecuteSqlRaw(
//                    $"""
//                    SELECT setval(
//                        COALESCE(
//                            pg_get_identity_sequence('"{bang}"'::regclass, '{cot}'),
//                            pg_get_serial_sequence('public."{bang}"', '{cot}')
//                        )::regclass,
//                        COALESCE((SELECT MAX("{cot}") FROM "{bang}"), 0),
//                        true
//                    );
//                    """);
//            }
//            catch (Exception exBang)
//            {
//                Console.WriteLine($"Đồng bộ sequence {bang}.{cot}: {exBang.Message}");
//            }
//        }
//    }
//}
//catch (Exception ex)
//{
//    Console.WriteLine($"Không đồng bộ sequence PostgreSQL (bỏ qua nếu DB chưa migrate): {ex.Message}");
//}

// ==========================================
// 7. PIPELINE REQUEST (Middleware)
// ==========================================
if (app.Environment.IsDevelopment())
{
   app.UseSwagger();
   app.UseSwaggerUI();
}
// app.UseSwagger();
// app.UseSwaggerUI();
// Local frontend ch?y HTTP (http://localhost:3000), n?n kh?ng redirect preflight OPTIONS sang HTTPS ? Development.
// Production v?n b?t bu?c HTTPS.
// Forwarded headers must run before HTTPS redirection and security middleware.
app.UseForwardedHeaders();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseStaticFiles();

// CORS: phải đặt sau UseRouting và trước UseAuthentication/UseAuthorization
// (https://learn.microsoft.com/en-us/aspnet/core/security/cors)
app.UseRouting();
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseCors("AllowReactApp");
app.UseRateLimiter();

// Authentication phải chạy TRƯỚC maintenance để middleware biết user có phải Admin đã đăng nhập
// hay không (J.1). Trước đây maintenance đứng trước authentication nên không thể phân biệt Admin.
app.UseAuthentication();
app.UseMiddleware<MaintenanceMiddleware>();
app.UseSessionCheck();
app.UseAuthorization();
app.MapHub<SystemConfigHub>("/systemConfigHub").RequireCors("AllowReactApp");
app.MapHub<SessionHub>("/sessionHub").RequireCors("AllowReactApp");

app.MapControllers();

app.Run();
