using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using flourishbackend.Data;

namespace flourishbackend;

public static class FlourishAuthExtensions
{
    public static async Task SignInFlourishUserAsync(this HttpContext http, FlourishDbContext db, Guid userId)
    {
        var isPartner = await db.SupportProfiles.AsNoTracking()
            .AnyAsync(s => s.UserId == userId);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim("user_type", isPartner ? "partner" : "mother"),
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await http.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity));
    }
}
