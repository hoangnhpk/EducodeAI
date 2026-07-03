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
builder.Services.AddScoped<ILoTrinhAIGvService, LoTrinhAIGvService>();
// C. Cấu hình CORS (Cho phép React/Giao diện gọi API)
builder.Services.AddScoped<ILoTrinhAIRepository, LoTrinhAIRepository>();
builder.Services.AddScoped<ILoTrinhAIService, LoTrinhAIService>();
builder.Services.AddScoped<IChatBotAIService, ChatBotAIService>();
builder.Services.AddScoped<IKeyApiRepository, KeyApiRepository>();
builder.Services.AddScoped<IKeyApiService, KeyApiService>();

builder.Services.AddScoped<ISinhDoAnAIService, SinhDoAnAIService>(); // Trạm Hỏi Cung – inject DbContext tự động qua DI
builder.Services.AddScoped<IChamDiemDoAnService, ChamDiemDoAnService>();

builder.Services.AddScoped<ISinhDoAnAIService, SinhDoAnAIService>();
builder.Services.AddScoped<IRateLimitService, RateLimitService>();
builder.Services.AddScoped<IMediaService, MediaService>();


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
var cloudinaryConfig = builder.Configuration.GetSection("Cloudinary").Get<CauHinhCloudinary>();
builder.Services.Configure<CauHinhCloudinary>(builder.Configuration.GetSection("Cloudinary"));
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

// Đồng bộ cột thiếu trên Supabase (vd. DeletedAt trên KhoaHocs)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
    await educodeai_server.Helpers.DatabaseSchemaSync.ApplyAsync(db);
}

// Khởi tạo cấu hình cho EmailHelper để có thể đọc appsettings.json
educodeai_server.Helpers.EmailHelper.Initialize(app.Configuration);

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
