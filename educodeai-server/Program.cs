using educodeai_server.Data;
using educodeai_server.Repository.Implementation;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Implementation;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

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
app.UseAuthorization();
app.MapControllers();

app.Run();