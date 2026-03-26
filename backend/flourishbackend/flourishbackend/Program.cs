using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using flourishbackend.Data;
using Flourish.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "flourish_auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.ExpireTimeSpan = TimeSpan.FromDays(14);
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var sqliteRelative = builder.Configuration.GetConnectionString("FlourishConnection")
    ?? "Data Source=BeatsMe.sqlite";
var sqliteFileName = sqliteRelative.Replace("Data Source=", "", StringComparison.OrdinalIgnoreCase).Trim();
var sqlitePath = Path.IsPathRooted(sqliteFileName)
    ? sqliteFileName
    : Path.Combine(builder.Environment.ContentRootPath, sqliteFileName);
builder.Services.AddDbContext<FlourishDbContext>(options =>
{
    options.UseSqlite($"Data Source={sqlitePath}");
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("FlourishCors", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();
app.UseCors("FlourishCors");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FlourishDbContext>();

    // Make sure DB + tables exist
    db.Database.Migrate();

    // Only add user if it doesn't already exist
    if (!db.UserProfiles.Any(u => u.Email == "test2@flourish.local"))
    {
        db.UserProfiles.Add(new UserProfile
        {
            UserId = Guid.NewGuid(), // adjust if your PK is named differently
            Email = "test2@flourish.local",
            Password = "dev" // IMPORTANT: match your login logic
        });

        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
