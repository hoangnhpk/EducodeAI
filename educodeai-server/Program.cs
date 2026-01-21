using educodeai_server.Config;
using educodeai_server.Data;
using educodeai_server.Helpers;
using educodeai_server.Repository.Implementation;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Implementation;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình API AI
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
builder.Services.AddScoped<IKhoaHocRepository, KhoaHocRepository>();
builder.Services.AddScoped<IKhoaHocService, KhoaHocService>();

// C. Cấu hình CORS (Cho phép React/Giao diện gọi API)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// D. Các dịch vụ hệ thống mặc định
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// D. Đăng ký các Service tùy chỉnh (Dependency Injection)
builder.Services.AddScoped<ILoTrinhAIService, LoTrinhAIService>();
builder.Services.AddScoped<IKhoaHocRepository, KhoaHocRepository>();
builder.Services.AddScoped<ILoTrinhAIRepository, LoTrinhAIRepository>();
builder.Services.AddScoped<IHocVienService, HocVienService>();


builder.Services.AddHttpClient<IGeminiAIService, GeminiAIService>((sp, client) =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var baseUrl = config["GeminiAI:BaseUrl"];
    var apiKey = config["GeminiAI:ApiKey"];

    client.BaseAddress = new Uri(baseUrl);

    client.DefaultRequestHeaders.Add(
        "x-goog-api-key",
        apiKey
    );
});

builder.Services.Configure<GeminiAIOptions>(
    builder.Configuration.GetSection("GeminiAI"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// B. Bảo mật và Định tuyến
app.UseHttpsRedirection();

// C. Kích hoạt CORS (Phải đặt TRƯỚC Authorization)
app.UseCors();
app.UseStaticFiles();
app.UseAuthorization();
app.MapControllers();

app.Run();