using educodeai_server.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CẤU HÌNH SERVICES (Dependency Injection)
// ==========================================

// A. Kết nối Database (SQL Server)
// Nó sẽ đọc chuỗi kết nối từ appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<EduCodeAIDbContext>(options =>
    options.UseSqlServer(connectionString));

// B. Cấu hình CORS (Quan trọng để Frontend React gọi được API)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()  // Cho phép mọi nguồn
              .AllowAnyHeader()  // Cho phép mọi Header
              .AllowAnyMethod(); // Cho phép mọi phương thức (GET, POST, PUT, DELETE)
    });
});

// C. Các Service mặc định
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // Swagger cơ bản, không có nút nhập Token

var app = builder.Build();

// ==========================================
// 2. CẤU HÌNH PIPELINE (Middleware)
// ==========================================

// A. Swagger (Hiển thị tài liệu API khi chạy môi trường Dev)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// B. Kích hoạt CORS (Phải đặt trước UseAuthorization)
app.UseCors();

// C. Các Middleware mặc định
app.UseAuthorization(); // Vẫn để đây cho đúng chuẩn, dù chưa dùng Auth

app.MapControllers();

app.Run();