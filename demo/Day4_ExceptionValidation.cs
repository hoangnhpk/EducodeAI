using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace DemoApp
{
    public class ProductRequest
    {
        [Required(ErrorMessage = "Tên sản phẩm không được rỗng")]
        public string Name { get; set; }
        
        [Range(0.01, double.MaxValue, ErrorMessage = "Giá phải là số dương")]
        public decimal Price { get; set; }
    }

    // Global Exception Handling Middleware
    public class GlobalExceptionHandler
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new 
                { 
                    Message = "Lỗi hệ thống không mong muốn", 
                    Detail = ex.Message 
                });
            }
        }
    }

    [ApiController]
    [Route("api/products")]
    public class ProductDay4Controller : ControllerBase
    {
        private static List<Product> _products = new List<Product>();

        [HttpPost("validate")]
        public IActionResult Create([FromBody] ProductRequest request)
        {
            // ASP.NET Core automatically returns 400 with ModelState if [ApiController] is used,
            // but we can also manually check it here for demonstration:
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = new Product
            {
                Id = _products.Count + 1,
                Name = request.Name,
                Price = request.Price
            };
            _products.Add(product);
            return Ok(product);
        }

        [HttpGet("{id}/notfound")]
        public IActionResult Get(int id)
        {
            var product = _products.Find(p => p.Id == id);
            if (product == null)
            {
                return NotFound(new { Message = $"Không tìm thấy sản phẩm với id {id}" }); 
            }
            return Ok(product);
        }
        
        [HttpGet("error")]
        public IActionResult ThrowError()
        {
            throw new Exception("Test Exception Handler");
        }
    }
}
