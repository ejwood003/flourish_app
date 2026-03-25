using System.Security.Claims;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using flourishbackend;
using Microsoft.AspNetCore.Authorization;
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

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var login = (request.Username ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(login) || string.IsNullOrEmpty(request.Password))
                return Unauthorized(new { error = "Invalid username or password" });

            var user = await _context.UserProfiles
                .FirstOrDefaultAsync(u =>
                    u.Password == request.Password &&
                    (u.Email == login || u.Username == login));

            if (user == null)
                return Unauthorized(new { error = "Invalid email or password" });

            var isPartner = await _context.SupportProfiles
                .AnyAsync(s => s.UserId == user.UserId);

            await HttpContext.SignInFlourishUserAsync(_context, user.UserId);

            return Ok(new
            {
                user_id = user.UserId,
                user_type = isPartner ? "partner" : "mother",
            });
        }

        [AllowAnonymous]
        [HttpPost("verify-support")]
        public async Task<IActionResult> VerifySupport([FromBody] VerifySupportRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MotherEmail) ||
                string.IsNullOrWhiteSpace(request.SupportEmail))
                return Ok(new { ok = false });

            var mother = (request.MotherEmail ?? string.Empty).Trim();
            var ok = await _context.UserProfiles.AsNoTracking()
                .AnyAsync(u =>
                    u.SupportEmail == request.SupportEmail &&
                    (u.Email == mother || u.Username == mother || u.CreatedBy == mother));

            return Ok(new { ok });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userType = User.FindFirstValue("user_type");
            if (string.IsNullOrEmpty(id))
                return Unauthorized();
            return Ok(new { user_id = id, user_type = userType });
        }

        [AllowAnonymous]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok();
        }
    }

    public class LoginRequest
    {
        [JsonPropertyName("username")]
        public string Username { get; set; } = "";

        [JsonPropertyName("password")]
        public string Password { get; set; } = "";
    }

    public class VerifySupportRequest
    {
        [JsonPropertyName("mother_email")]
        public string MotherEmail { get; set; } = "";

        [JsonPropertyName("support_email")]
        public string SupportEmail { get; set; } = "";
    }
}
