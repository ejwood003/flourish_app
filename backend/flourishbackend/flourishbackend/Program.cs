using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using flourishbackend.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Production: cross-site cookies (Static Web App + separate API, or any HTTPS SPA on another origin).
// Development: Lax + SameAsRequest for localhost Vite proxy.
var useCrossSiteCookies = builder.Configuration.GetValue<bool?>("Auth:UseCrossSiteCookies")
    ?? builder.Environment.IsProduction();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "flourish_auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = useCrossSiteCookies ? SameSiteMode.None : SameSiteMode.Lax;
        options.Cookie.SecurePolicy = useCrossSiteCookies ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
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

var sqliteConnection = builder.Configuration.GetConnectionString("FlourishConnection")
    ?? "Data Source=BeatsMe.sqlite";
var sqlitePath = Program.ResolveSqliteDatabasePath(sqliteConnection, builder.Environment, builder.Configuration);
var sqliteDir = Path.GetDirectoryName(sqlitePath);
if (!string.IsNullOrEmpty(sqliteDir))
    Directory.CreateDirectory(sqliteDir);

Console.WriteLine($"[Flourish] SQLite database path: {sqlitePath}");

builder.Services.AddDbContext<FlourishDbContext>(options =>
{
    options.UseSqlite($"Data Source={sqlitePath}");
});

var corsAllowed = Program.BuildCorsAllowedOrigins(builder.Configuration, builder.Environment);
var corsAllowAzureSw = builder.Configuration.GetValue("Cors:AllowAzureStaticWebApps", builder.Environment.IsProduction());

builder.Services.AddCors(options =>
{
    options.AddPolicy("FlourishCors", policy =>
    {
        policy.AllowAnyHeader();
        policy.AllowAnyMethod();
        policy.AllowCredentials();
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrWhiteSpace(origin)) return false;
            var normalized = origin.TrimEnd('/');
            if (corsAllowed.Contains(normalized)) return true;
            if (!corsAllowAzureSw) return false;
            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;
            return uri.Host.EndsWith(".azurestaticapps.net", StringComparison.OrdinalIgnoreCase);
        });
    });
});

var app = builder.Build();
app.UseForwardedHeaders();
app.UseCors("FlourishCors");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FlourishDbContext>();
    db.Database.Migrate();
    DevUserSeed.EnsureDevUser(db);
    DevUserSeed.EnsureSecondTestUser(db);
    DevUserSeed.EnsureDevUserEmail(db);
    DevUserSeed.EnsureSecondTestUserEmail(db);
    DevUserSeed.EnsureDevBabyProfile(db);
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

public partial class Program
{
    internal static HashSet<string> BuildCorsAllowedOrigins(IConfiguration configuration, IHostEnvironment environment)
    {
        var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var o in configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
        {
            var t = o?.Trim();
            if (!string.IsNullOrEmpty(t))
                set.Add(t.TrimEnd('/'));
        }

        var envOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS");
        if (!string.IsNullOrWhiteSpace(envOrigins))
        {
            foreach (var part in envOrigins.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                set.Add(part.TrimEnd('/'));
        }

        set.Add("http://localhost:3000");
        set.Add("http://127.0.0.1:3000");
        if (environment.IsDevelopment())
        {
            set.Add("https://localhost:3000");
            set.Add("https://127.0.0.1:3000");
        }

        return set;
    }

    /// <summary>
    /// SQLite path: relative names use ContentRoot locally; on Azure App Service (WEBSITE_SITE_NAME) use
    /// persistent D:\home\data (Windows) or /home/data (Linux). Override with env FLUORISH_DB_DIRECTORY or
    /// config Flourish:DatabaseDirectory, or set ConnectionStrings__FlourishConnection to a full path.
    /// </summary>
    public static string ResolveSqliteDatabasePath(string connectionString, IHostEnvironment env, IConfiguration configuration)
    {
        var filePart = connectionString.Replace("Data Source=", "", StringComparison.OrdinalIgnoreCase).Trim();
        if (Path.IsPathRooted(filePart))
            return filePart;

        var overrideDir = configuration["Flourish:DatabaseDirectory"]
            ?? Environment.GetEnvironmentVariable("FLUORISH_DB_DIRECTORY");
        if (!string.IsNullOrWhiteSpace(overrideDir))
        {
            var dir = overrideDir.Trim();
            Directory.CreateDirectory(dir);
            return Path.Combine(dir, filePart.TrimStart('/', '\\'));
        }

        if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME")))
        {
            var persistentRoot = OperatingSystem.IsWindows()
                ? @"D:\home\data"
                : "/home/data";
            Directory.CreateDirectory(persistentRoot);
            return Path.Combine(persistentRoot, filePart.TrimStart('/', '\\'));
        }

        return Path.Combine(env.ContentRootPath, filePart);
    }
}
