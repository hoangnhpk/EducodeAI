using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace DemoApp
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProfileController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            
            if (user == null) return NotFound();
            
            return Ok(new { user.Id, user.Username, user.Email, user.Role });
        }

        [HttpPut]
        public IActionResult UpdateProfile(User dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            
            if (user == null) return NotFound();
            
            user.Email = dto.Email;
            _context.SaveChanges();
            return Ok(user);
        }
    }

    [ApiController]
    [Route("api/admin/products")]
    [Authorize(Roles = "Admin")]
    public class AdminProductController : ControllerBase
    {
        private readonly StoreDbContext _storeContext;

        public AdminProductController(StoreDbContext storeContext)
        {
            _storeContext = storeContext;
        }

        [HttpDelete("{id}")]
        public IActionResult AdminDeleteProduct(int id)
        {
            var product = _storeContext.Products.FirstOrDefault(p => p.Id == id);
            if (product == null) return NotFound();

            _storeContext.Products.Remove(product);
            _storeContext.SaveChanges();
            return NoContent();
        }
    }
}
