// ==========================================
// NGÀY 5: T?I UU HÓA, VALIDATION VÀ X? LÝ L?I (Global Handling)
// ==========================================
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Demo.Ngay2;

namespace Demo.Ngay5
{
    // --- 1. GLOBAL EXCEPTION HANDLING MIDDLEWARE ---
    // Vi?t Middleware x? lý l?i t?p trung d? tr? v? format l?i chu?n.
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger) { _next = next; _logger = logger; }

        public async Task InvokeAsync(HttpContext context)
        {
            try { await _next(context); }
            catch (Exception ex)
            {
                _logger.LogError(ex, ""L?i h? th?ng: "" + ex.Message);
                context.Response.ContentType = ""application/json"";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                var response = new { 
                    StatusCode = context.Response.StatusCode, 
                    Message = ""Ðã x?y ra l?i h? th?ng, vui lòng th? l?i sau."", 
                    Detailed = ex.Message 
                };
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        }
    }

    // --- 2. FLUENT VALIDATION CHO REQUEST DTO ---
    // Tri?n khai FluentValidation d? validate d? li?u d?u vào cho các Request.
    public class ProductDtoValidator : AbstractValidator<ProductDto>
    {
        public ProductDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage(""Tên s?n ph?m không du?c d? tr?ng."");
            RuleFor(x => x.Price).GreaterThan(0).WithMessage(""Giá ph?i l?n hon 0."");
            RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0).WithMessage(""S? lu?ng t?n kho không h?p l?."");
        }
    }

    // --- 3. T?I UU HÓA B?NG .AsNoTracking() ---
    // T?i uu hóa truy v?n b?ng cách s? d?ng .AsNoTracking() cho các API ch? d?c.
    public static class OptimizationExample
    {
        // Ví d? do?n mã truy v?n dã du?c t?i uu hóa trong CatalogService (Ngày 2)
        /*
        public async Task<List<ProductDto>> GetProductsAsync()
        {
            return await _context.Set<Product>()
                .AsNoTracking() // Dùng cho các query ch? d?c d? t?i uu RAM
                .Select(p => new ProductDto { Id = p.Id, Name = p.Name })
                .ToListAsync();
        }
        */
    }
}
