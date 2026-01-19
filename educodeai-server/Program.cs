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

// ==========================================================
// ĐĂNG KÝ REPOSITORY VÀ SERVICE 
// ==========================================================
builder.Services.AddScoped<IKhoaHocRepository, KhoaHocRepository>();
builder.Services.AddScoped<IKhoaHocService, KhoaHocService>();
// ==========================================================

// B. Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// C. Các Service mặc định
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();