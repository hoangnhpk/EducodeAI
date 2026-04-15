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
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: true)
    .AddEnvironmentVariables();

builder.Configuration.AddUserSecrets<Program>();

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
    options.UseNpgsql(connectionString));

try
{
    var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
    if (!string.IsNullOrEmpty(redisConnectionString))
    {
        var redis = ConnectionMultiplexer.Connect(redisConnectionString);
        builder.Services.AddSingleton<IConnectionMultiplexer>(redis);
        builder.Services.AddScoped<IRedisService, RedisService>();
        Console.WriteLine("Redis connected successfully");
    }
    else
    {
        throw new Exception("Redis connection string is empty");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Redis connection failed, using MemoryCache fallback: {ex.Message}");
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
builder.Services.AddScoped<IKhoaHocRepository, KhoaHocRepository>();
builder.Services.AddScoped<IKhoaHocService, KhoaHocService>();
builder.Services.AddScoped<IKhoaHocCuaToiService, KhoaHocCuaToiService>();
builder.Services.AddScoped<IBaiTapRepository, BaiTapRepository>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddHttpClient<BaiTapService>();

// Người dùng & Thống kê

builder.Services.AddScoped<INguoiDungRepository, NguoiDungRepository>();
builder.Services.AddScoped<INguoiDungService, NguoiDungService>();
builder.Services.AddScoped<IHocVienService, HocVienService>();
builder.Services.AddScoped<IKhongGianHocTapService, KhongGianHocTapService>();
builder.Services.AddScoped<IThongKeHocTapService, ThongKeHocTapService>();

// AI & Lộ trình
builder.Services.AddScoped<IKhoaHocCuaToiRepository, KhoaHocCuaToiRepository>();
builder.Services.AddScoped<IKhoaHocCuaToiService, KhoaHocCuaToiService>();
builder.Services.AddScoped<IQuanLyNguoiDungRepository, QuanLyNguoiDungRepository>();
builder.Services.AddScoped<IQuanLyNguoiDungService, QuanLyNguoiDungService>();
builder.Services.AddScoped<IQuanLyHocVienService,QuanLyHocVienService>();
builder.Services.AddScoped<IQuanLyHocVienKhoaHocService, QuanLyHocVienKhoaHocService>();
builder.Services.AddScoped<ILoTrinhAIGvRepository, LoTrinhAIGvRepository>();
builder.Services.AddScoped<ILoTrinhAIGvService, LoTrinhAIGvService>();
// C. Cấu hình CORS (Cho phép React/Giao diện gọi API)
builder.Services.AddScoped<ILoTrinhAIRepository, LoTrinhAIRepository>();
builder.Services.AddScoped<ILoTrinhAIService, LoTrinhAIService>();
builder.Services.AddScoped<IChatBotAIService, ChatBotAIService>();
builder.Services.AddScoped<IKeyApiRepository, KeyApiRepository>();
builder.Services.AddScoped<IKeyApiService, KeyApiService>();


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

builder.Services.Configure<GeminiAIOptions>(builder.Configuration.GetSection("GeminiAI"));

// ==========================================
// 6. CẤU HÌNH CORS & SWAGGER
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5210")
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

// Kích hoạt CORS (Phải đặt trước UseAuthorization)
app.UseCors("AllowReactApp");
app.UseStaticFiles();

app.UseAuthentication();
app.UseSessionCheck();
app.UseAuthorization();

app.MapControllers();

app.Run();