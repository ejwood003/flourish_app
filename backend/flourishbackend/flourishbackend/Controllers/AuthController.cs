using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using flourishbackend.Data;

namespace flourishbackend.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly FlourishDbContext _context;

        public AuthController(FlourishDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.UserProfiles
                .FirstOrDefaultAsync(u => u.Username == request.Username 
                                       && u.Password == request.Password);

            if (user == null)
                return Unauthorized(new { error = "Invalid username or password" });

            var isPartner = await _context.SupportProfiles
                .AnyAsync(s => s.UserId == user.UserId);

            return Ok(new {
                userId = user.UserId,
                userType = isPartner ? "partner" : "mother"
            });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }
}
