using educodeai_server.Config;
using educodeai_server.Data;
using educodeai_server.Helpers;
using educodeai_server.Repository.Implementation;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Implementation;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Configuration
builder.Configuration
    .AddJsonFile("appsettings.json", optional: true)
    .AddEnvironmentVariables();

#if DEBUG
builder.Configuration.AddUserSecrets<Program>();
#endif

// ==========================================
// 1. CẤU HÌNH SERVICES (Dependency Injection)
// ==========================================

// A. Kết nối Database (SQL Server)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<EduCodeAIDbContext>(options =>
    options.UseSqlServer(connectionString));

// B. Đăng ký Repository và Service (Dependency Injection)
// Lưu ý: Đã xóa các dòng bị trùng lặp ở code cũ
builder.Services.AddScoped<IKhoaHocRepository, KhoaHocRepository>();
builder.Services.AddScoped<IKhoaHocService, KhoaHocService>();
builder.Services.AddScoped<ILoTrinhAIRepository, LoTrinhAIRepository>();
builder.Services.AddScoped<ILoTrinhAIService, LoTrinhAIService>();

// C. Cấu hình CORS (QUAN TRỌNG: Sửa phần này để khớp với withCredentials: true)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// D. Các dịch vụ hệ thống mặc định
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// E. Cấu hình HTTP Client cho Gemini AI
builder.Services.AddHttpClient<IGeminiAIService, GeminiAIService>((sp, client) =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var baseUrl = config["GeminiAI:BaseUrl"];
    var apiKey = config["GeminiAI:ApiKey"];

    // Kiểm tra null để tránh lỗi runtime nếu chưa cấu hình
    if (!string.IsNullOrEmpty(baseUrl))
    {
        client.BaseAddress = new Uri(baseUrl);
    }

    if (!string.IsNullOrEmpty(apiKey))
    {
        client.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);
    }
});

builder.Services.Configure<GeminiAIOptions>(
    builder.Configuration.GetSection("GeminiAI"));

var app = builder.Build();

// ==========================================
// 2. PIPELINE REQUEST (Middleware)
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Kích hoạt CORS (Phải đặt trước UseAuthorization)
app.UseCors();

app.UseAuthorization();
app.MapControllers();

app.Run();