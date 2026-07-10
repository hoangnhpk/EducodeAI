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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using CloudinaryDotNet;
using Google.Cloud.Speech.V1;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;
using educodeai_server.Hubs;
using educodeai_server.Workers;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: true)
    .AddEnvironmentVariables();

builder.Configuration.AddUserSecrets<Program>();
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
        Console.WriteLine("JWT KEY (VERIFY): " + builder.Configuration["Jwt:Key"]);

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
            RoleClaimType = ClaimTypes.Role
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
    }
    else
    {
        var reason = !isRedisActive ? "turned OFF in appsettings" : "empty connection string";
        Console.WriteLine($"Redis is {reason} – using MemoryCache fallback");
        builder.Services.AddScoped<IRedisService, FallbackRedisService>();
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Redis setup failed, using MemoryCache fallback: {ex.Message}");
    builder.Services.AddScoped<IRedisService, FallbackRedisService>();
}


// ==========================================
// 4. ĐĂNG KÝ DEPENDENCY INJECTION (DI)
// ==========================================
builder.Services.AddHttpContextAccessor();
// Thêm bộ nhớ tạm để lưu OTP mà không cần dùng Database
builder.Services.AddMemoryCache();
// Dịch vụ Xác thực và Captcha mới
builder.Services.AddScoped<ICaptchaService, CaptchaService>();
builder.Services.AddScoped<IXacThucService, XacThucService>();
// Khóa học & Bài tập
builder.Services.AddScoped<IKhamPhaLoTrinhService, KhamPhaLoTrinhService>();
builder.Services.AddScoped<IKhoaHocRepository, KhoaHocRepository>();
builder.Services.AddScoped<IKhoaHocService, KhoaHocService>();
builder.Services.AddScoped<IThanhToanKhoaHocService, ThanhToanKhoaHocService>();
builder.Services.AddScoped<IMaGiamGiaService, MaGiamGiaService>();
builder.Services.AddScoped<IQuaTangKhoaHocService, QuaTangKhoaHocService>();
builder.Services.AddScoped<IThanhToanEmailService, ThanhToanEmailService>();
builder.Services.AddScoped<IRutTienGiangVienEmailService, RutTienGiangVienEmailService>();
builder.Services.AddScoped<IRutTienGiangVienService, RutTienGiangVienService>();
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
builder.Services.AddTransient<IAiSubtitleWorker, AiSubtitleWorker>();
builder.Services.AddHostedService<educodeai_server.Services.Implementation.StaleHoldCleanupService>();


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

builder.Services.Configure<GeminiAIOptions>(builder.Configuration.GetSection("GeminiAI"));
builder.Services.Configure<PaymentMailOptions>(builder.Configuration.GetSection("PaymentMail"));

// Cloudinary Configuration
builder.Services.Configure<CauHinhCloudinary>(builder.Configuration.GetSection("Cloudinary"));

// Google Cloud Configuration
builder.Services.Configure<CauHinhGoogleCloud>(builder.Configuration.GetSection("GoogleCloud"));

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
        policy.WithOrigins("https://educodeai-client.vercel.app",
                           "http://localhost:3000", "http://localhost:3001",
                           "http://127.0.0.1:3000", "http://127.0.0.1:3001",
                           "http://[::1]:3000", "http://[::1]:3001")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

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
        // === SELF-HEALING: HoSoDangKyGiangViens (đăng ký giảng viên) ===
        db.Database.ExecuteSqlRaw("""ALTER TABLE "HoSoDangKyGiangViens" ALTER COLUMN "MaNguoiDung" TYPE integer USING "MaNguoiDung"::integer;""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "HoSoDangKyGiangViens" ALTER COLUMN "MaNguoiDung" DROP NOT NULL;""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "HoSoDangKyGiangViens" ADD COLUMN IF NOT EXISTS "TaiKhoan" character varying(50) NOT NULL DEFAULT '';""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "HoSoDangKyGiangViens" ADD COLUMN IF NOT EXISTS "MatKhau" character varying(255) NOT NULL DEFAULT '';""");

        db.Database.ExecuteSqlRaw("""ALTER TABLE "HoSoDangKyGiangViens" ADD COLUMN IF NOT EXISTS "BoSungToken" character varying(64) NULL;""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "HoSoDangKyGiangViens" ADD COLUMN IF NOT EXISTS "BoSungTokenHetHan" timestamp with time zone NULL;""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "HoSoDangKyGiangViens" ADD COLUMN IF NOT EXISTS "DaNopBoSung" boolean NOT NULL DEFAULT false;""");
        db.Database.ExecuteSqlRaw("""ALTER TABLE "HoSoDangKyGiangViens" ADD COLUMN IF NOT EXISTS "NgayNopBoSung" timestamp with time zone NULL;""");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Schema bootstrap (gift-code) bỏ qua: {ex.Message}");
}

// === SELF-HEALING: cột video/phụ đề + bảng phụ trợ của phase upload video cloud ===
// Tách riêng khỏi khối gift-code ở trên: nếu 1 lệnh ALTER của gift-code ném lỗi (VD bảng
// chưa tồn tại trên DB restore từ backup), khối try đó sẽ abort giữa chừng và KHÔNG chạy
// tới đây. ApplyAsync idempotent (ADD COLUMN / CREATE TABLE IF NOT EXISTS) nên an toàn.
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
    Console.WriteLine($"Schema sync (video upload) bỏ qua: {ex.Message}");
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
app.UseHttpsRedirection();
app.UseStaticFiles();

// CORS: phải đặt sau UseRouting và trước UseAuthentication/UseAuthorization
// (https://learn.microsoft.com/en-us/aspnet/core/security/cors)
app.UseRouting();
app.UseCors("AllowReactApp");
app.UseMiddleware<MaintenanceMiddleware>();

app.UseAuthentication();
app.UseSessionCheck();
app.UseAuthorization();
app.MapHub<SystemConfigHub>("/systemConfigHub").RequireCors("AllowReactApp");

app.MapControllers();

app.Run();
