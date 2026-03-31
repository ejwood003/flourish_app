using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using flourishbackend;
using flourishbackend.Data;
using Flourish.Models;

namespace flourishbackend.Controllers
{
    [Route("api/apps/{appId}/entities/{entityName}")]
    [ApiController]
    public class EntitiesController : ControllerBase
    {
        private readonly FlourishDbContext _context;
        private readonly IFlourishAccessTokenIssuer _accessTokens;

        // Map frontend entity names to DbContext property names
        private static readonly Dictionary<string, string> EntityMap = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Affirmation"] = "Affirmations",
            ["AffirmationReaction"] = "AffirmationReactions",
            ["BabyActivity"] = "BabyActivities",
            ["BabyMood"] = "BabyMoods",
            ["BabyProfile"] = "BabyProfiles",
            ["JournalEntry"] = "JournalEntries",
            ["MeditationSession"] = "MeditationSessions",
            ["MoodEntry"] = "MoodEntries",
            ["SavedResource"] = "SavedResources",
            ["SupportProfile"] = "SupportProfiles",
            ["SupportRequest"] = "SupportRequests",
            ["UserProfile"] = "UserProfiles",
        };

        // Map entity names to their CLR types
        private static readonly Dictionary<string, Type> EntityTypeMap = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Affirmation"] = typeof(Flourish.Models.Affirmation),
            ["AffirmationReaction"] = typeof(Flourish.Models.AffirmationReaction),
            ["BabyActivity"] = typeof(Flourish.Models.BabyActivity),
            ["BabyMood"] = typeof(Flourish.Models.BabyMood),
            ["BabyProfile"] = typeof(Flourish.Models.BabyProfile),
            ["JournalEntry"] = typeof(Flourish.Models.JournalEntry),
            ["MeditationSession"] = typeof(Flourish.Models.MeditationSession),
            ["MoodEntry"] = typeof(Flourish.Models.MoodEntry),
            ["SavedResource"] = typeof(Flourish.Models.SavedResource),
            ["SupportProfile"] = typeof(Flourish.Models.SupportProfile),
            ["SupportRequest"] = typeof(Flourish.Models.SupportRequest),
            ["UserProfile"] = typeof(Flourish.Models.UserProfile),
        };

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>Entities with a UserId that must match the signed-in user (list scope); partners may list another id if linked via SupportEmail.</summary>
        private static readonly HashSet<string> UserOwnedEntityNames = new(StringComparer.OrdinalIgnoreCase)
        {
            "BabyActivity",
            "BabyMood",
            "BabyProfile",
            "JournalEntry",
            "MeditationSession",
            "MoodEntry",
            "SavedResource",
            "SupportRequest",
            "AffirmationReaction",
            "SupportProfile",
        };

        public EntitiesController(FlourishDbContext context, IFlourishAccessTokenIssuer accessTokens)
        {
            _context = context;
            _accessTokens = accessTokens;
        }

        private UnauthorizedObjectResult? RequireAuthenticated()
        {
            if (User?.Identity?.IsAuthenticated == true) return null;
            return Unauthorized(new { error = "Authentication required" });
        }

        /// <summary>Allow anonymous only for mother/partner self-registration (UserProfile create).</summary>
        private UnauthorizedObjectResult? RequireAuthenticatedForCreate(string entityName)
        {
            if (string.Equals(entityName, "UserProfile", StringComparison.OrdinalIgnoreCase))
                return null;
            return RequireAuthenticated();
        }

        private static ContentResult JsonContent(string json, int statusCode)
        {
            return new ContentResult
            {
                Content = json,
                ContentType = "application/json",
                StatusCode = statusCode
            };
        }

        // GET: api/apps/{appId}/entities/{entityName}
        [HttpGet]
        public async Task<IActionResult> List(
            string appId,
            string entityName,
            [FromQuery] string? sort = null,
            [FromQuery] int? limit = null,
            [FromQuery] int? skip = null,
            [FromQuery] string? q = null)
        {
            var dbSet = GetDbSet(entityName);
            if (dbSet == null) return NotFound(new { error = $"Entity '{entityName}' not found" });

            var authFail = RequireAuthenticated();
            if (authFail != null) return authFail;

            var entityType = EntityTypeMap[entityName];

            IQueryable query = (IQueryable)dbSet;

            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentUserId))
                return Unauthorized(new { error = "Authentication required" });

            Dictionary<string, JsonElement>? filterDict = null;
            if (!string.IsNullOrEmpty(q))
            {
                try
                {
                    filterDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(q, _jsonOptions);
                }
                catch
                {
                    filterDict = null;
                }
            }

            var (scopedQuery, scopeError) = await ApplyUserOwnedListScopeAsync(query, entityType, entityName, currentUserId, filterDict).ConfigureAwait(false);
            if (scopeError != null)
                return scopeError;
            query = scopedQuery;

            if (filterDict != null)
            {
                foreach (var (key, value) in filterDict)
                {
                    var propInfo = FindProperty(entityType, key);
                    if (propInfo == null) continue;
                    var targetValue = ConvertJsonElement(value, propInfo.PropertyType);
                    if (targetValue != null)
                        query = ApplyWherePropertyEquals(query, entityType, propInfo, targetValue);
                }
            }

            if (!string.IsNullOrEmpty(sort))
            {
                var descending = sort.StartsWith("-");
                var sortField = sort.TrimStart('-', '+');
                var sortProp = FindProperty(entityType, sortField);
                if (sortProp != null)
                    query = ApplyOrderByProperty(query, entityType, sortProp, descending);
            }

            if (skip.HasValue)
                query = ApplySkip(query, entityType, skip.Value);

            if (limit.HasValue)
                query = ApplyTake(query, entityType, limit.Value);

            var results = await ExecuteToListAsync(query, entityType);
            var json = JsonSerializer.Serialize(results, results.GetType(), _jsonOptions);
            return Content(json, "application/json");
        }

        // GET: api/apps/{appId}/entities/{entityName}/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string appId, string entityName, string id)
        {
            var dbSet = GetDbSet(entityName);
            if (dbSet == null) return NotFound(new { error = $"Entity '{entityName}' not found" });

            if (!Guid.TryParse(id, out Guid guidId))
                return BadRequest(new { error = "Invalid ID format" });

            var authFailGet = RequireAuthenticated();
            if (authFailGet != null) return authFailGet;

            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentUserIdGet))
                return Unauthorized(new { error = "Authentication required" });

            var entity = await _context.FindAsync(EntityTypeMap[entityName], guidId);
            if (entity == null) return NotFound(new { error = "Record not found" });

            var accessGet = EnsureDirectUserOwnedAccess(entity, entityName, currentUserIdGet);
            if (accessGet != null) return accessGet;

            var json = JsonSerializer.Serialize(entity, _jsonOptions);
            return Content(json, "application/json");
        }

        // POST: api/apps/{appId}/entities/{entityName}
        [HttpPost]
        public async Task<IActionResult> Create(string appId, string entityName)
        {
            var dbSet = GetDbSet(entityName);
            if (dbSet == null) return NotFound(new { error = $"Entity '{entityName}' not found" });

            var createAuth = RequireAuthenticatedForCreate(entityName);
            if (createAuth != null) return createAuth;

            var entityType = EntityTypeMap[entityName];

            // Read the raw JSON body
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();

            object? entity;
            try
            {
                entity = JsonSerializer.Deserialize(body, entityType, _jsonOptions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = $"Invalid JSON: {ex.Message}" });
            }

            if (entity == null)
                return BadRequest(new { error = "Could not parse request body" });

            if (entity is Flourish.Models.UserProfile userProfile)
                userProfile.EnsureDefaults();

            if (!string.Equals(entityName, "UserProfile", StringComparison.OrdinalIgnoreCase))
            {
                if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var creatorUserId))
                    return Unauthorized(new { error = "Authentication required" });
                ForceUserIdOnNewEntity(entity, creatorUserId);
                var babyRefErr = await ValidateBabyCreateReferencesAsync(entity).ConfigureAwait(false);
                if (babyRefErr != null) return babyRefErr;
            }

            // Ensure a new GUID is set for the primary key ([Key] or legacy "Id")
            var idProp = entityType.GetProperties().FirstOrDefault(p => Attribute.IsDefined(p, typeof(System.ComponentModel.DataAnnotations.KeyAttribute)))
                ?? entityType.GetProperty("Id");
            if (idProp != null)
            {
                idProp.SetValue(entity, Guid.NewGuid());
            }

            // Entities use *Id as key (e.g. MoodEntryId). Deserialization leaves Guid.Empty if key was omitted — fix that.
            foreach (var prop in entityType.GetProperties())
            {
                if (prop.PropertyType != typeof(Guid)) continue;
                if (prop.GetCustomAttribute<KeyAttribute>() == null) continue;
                if (prop.GetValue(entity) is Guid g && g == Guid.Empty)
                    prop.SetValue(entity, Guid.NewGuid());
            }

            // Set CreatedDate to now
            var createdDateProp = entityType.GetProperty("CreatedDate");
            if (createdDateProp != null)
            {
                createdDateProp.SetValue(entity, DateTime.UtcNow);
            }

            _context.Add(entity);
            await _context.SaveChangesAsync();

            if (entity is UserProfile createdProfile)
            {
                await HttpContext.SignInFlourishUserAsync(_context, createdProfile.UserId);
                var isPartner = await _context.SupportProfiles.AsNoTracking()
                    .AnyAsync(s => s.UserId == createdProfile.UserId);
                var userType = isPartner ? "partner" : "mother";
                var accessToken = _accessTokens.CreateAccessToken(createdProfile.UserId, userType);
                var node = JsonSerializer.SerializeToNode(entity, _jsonOptions);
                if (node is JsonObject jo && accessToken != null)
                    jo["access_token"] = accessToken;
                return JsonContent(node!.ToJsonString(), StatusCodes.Status201Created);
            }

            var json = JsonSerializer.Serialize(entity, _jsonOptions);
            return JsonContent(json, StatusCodes.Status201Created);
        }

        // PUT / PATCH: api/apps/{appId}/entities/{entityName}/{id}
        // PATCH avoids 405 when clients, proxies, or hosts only allow PATCH for partial updates.
        [HttpPut("{id}")]
        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(string appId, string entityName, string id)
        {
            var dbSet = GetDbSet(entityName);
            if (dbSet == null) return NotFound(new { error = $"Entity '{entityName}' not found" });

            if (!Guid.TryParse(id, out Guid guidId))
                return BadRequest(new { error = "Invalid ID format" });

            var authFailUpdate = RequireAuthenticated();
            if (authFailUpdate != null) return authFailUpdate;

            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentUserIdUpdate))
                return Unauthorized(new { error = "Authentication required" });

            var entityType = EntityTypeMap[entityName];
            var existing = await _context.FindAsync(entityType, guidId);
            if (existing == null) return NotFound(new { error = "Record not found" });

            var accessUpdate = EnsureDirectUserOwnedAccess(existing, entityName, currentUserIdUpdate);
            if (accessUpdate != null) return accessUpdate;

            // Read the raw JSON body
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();

            Dictionary<string, JsonElement>? updates;
            try
            {
                updates = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(body, _jsonOptions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = $"Invalid JSON: {ex.Message}" });
            }

            if (updates == null)
                return BadRequest(new { error = "Could not parse request body" });

            // Apply each field from the update body to the existing entity
            foreach (var (key, value) in updates)
            {
                // Skip id and created_date — these should not be updated
                if (key.Equals("id", StringComparison.OrdinalIgnoreCase) ||
                    key.Equals("user_id", StringComparison.OrdinalIgnoreCase) ||
                    key.Equals("created_date", StringComparison.OrdinalIgnoreCase))
                    continue;

                var propInfo = FindProperty(entityType, key);
                if (propInfo != null && propInfo.CanWrite)
                {
                    try
                    {
                        var convertedValue = ConvertJsonElement(value, propInfo.PropertyType);
                        if (convertedValue == null)
                        {
                            // Do not assign null into non-nullable value types (omit = no change)
                            var u = Nullable.GetUnderlyingType(propInfo.PropertyType);
                            if (u == null && propInfo.PropertyType.IsValueType)
                                continue;
                            propInfo.SetValue(existing, null);
                            continue;
                        }
                        propInfo.SetValue(existing, convertedValue);
                    }
                    catch
                    {
                        // Skip fields that can't be converted
                    }
                }
            }

            _context.Update(existing);
            await _context.SaveChangesAsync();

            var json = JsonSerializer.Serialize(existing, _jsonOptions);
            return Content(json, "application/json");
        }

        // DELETE: api/apps/{appId}/entities/{entityName}/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string appId, string entityName, string id)
        {
            var dbSet = GetDbSet(entityName);
            if (dbSet == null) return NotFound(new { error = $"Entity '{entityName}' not found" });

            if (!Guid.TryParse(id, out Guid guidId))
                return BadRequest(new { error = "Invalid ID format" });

            var authFailDelete = RequireAuthenticated();
            if (authFailDelete != null) return authFailDelete;

            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentUserIdDelete))
                return Unauthorized(new { error = "Authentication required" });

            var entity = await _context.FindAsync(EntityTypeMap[entityName], guidId);
            if (entity == null) return NotFound(new { error = "Record not found" });

            var accessDelete = EnsureDirectUserOwnedAccess(entity, entityName, currentUserIdDelete);
            if (accessDelete != null) return accessDelete;

            _context.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --- Helper Methods ---

        private async Task<(IQueryable Query, IActionResult? Error)> ApplyUserOwnedListScopeAsync(
            IQueryable query,
            Type entityType,
            string entityName,
            Guid currentUserId,
            Dictionary<string, JsonElement>? filterDict)
        {
            var userIdProp = entityType.GetProperty("UserId");
            if (userIdProp == null || userIdProp.PropertyType != typeof(Guid))
                return (query, null);

            if (UserOwnedEntityNames.Contains(entityName))
            {
                var clientRequested = ExtractUserIdFromFilterDict(filterDict);
                filterDict?.Remove("user_id");

                Guid effectiveUserId;
                if (clientRequested is null || clientRequested.Value == currentUserId)
                    effectiveUserId = currentUserId;
                else
                {
                    if (!await PartnerCanViewMotherDataAsync(currentUserId, clientRequested.Value).ConfigureAwait(false))
                        return (query, StatusCode(StatusCodes.Status403Forbidden, new { error = "Forbidden" }));
                    effectiveUserId = clientRequested.Value;
                }

                query = ApplyWherePropertyEquals(query, entityType, userIdProp, effectiveUserId);
                return (query, null);
            }

            if (string.Equals(entityName, "UserProfile", StringComparison.OrdinalIgnoreCase))
            {
                if (filterDict != null && filterDict.ContainsKey("support_email"))
                    return (query, null);

                var clientRequested = ExtractUserIdFromFilterDict(filterDict);
                filterDict?.Remove("user_id");

                Guid effectiveUserId;
                if (clientRequested is null || clientRequested.Value == currentUserId)
                    effectiveUserId = currentUserId;
                else
                {
                    if (!await PartnerCanViewMotherDataAsync(currentUserId, clientRequested.Value).ConfigureAwait(false))
                        return (query, StatusCode(StatusCodes.Status403Forbidden, new { error = "Forbidden" }));
                    effectiveUserId = clientRequested.Value;
                }

                query = ApplyWherePropertyEquals(query, entityType, userIdProp, effectiveUserId);
                return (query, null);
            }

            return (query, null);
        }

        private static Guid? ExtractUserIdFromFilterDict(Dictionary<string, JsonElement>? filterDict)
        {
            if (filterDict == null || !filterDict.TryGetValue("user_id", out var el))
                return null;
            if (el.ValueKind != JsonValueKind.String)
                return null;
            var s = el.GetString();
            return Guid.TryParse(s, out var g) ? g : null;
        }

        private async Task<bool> PartnerCanViewMotherDataAsync(Guid partnerUserId, Guid motherUserId)
        {
            var partner = await _context.UserProfiles.AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == partnerUserId).ConfigureAwait(false);
            var mother = await _context.UserProfiles.AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == motherUserId).ConfigureAwait(false);
            if (partner == null || mother == null || string.IsNullOrWhiteSpace(mother.SupportEmail))
                return false;
            var target = mother.SupportEmail.Trim();
            var pEmail = partner.Email?.Trim();
            var pUser = partner.Username?.Trim();
            return (pEmail != null && string.Equals(pEmail, target, StringComparison.OrdinalIgnoreCase)) ||
                   (pUser != null && string.Equals(pUser, target, StringComparison.OrdinalIgnoreCase));
        }

        private IActionResult? EnsureDirectUserOwnedAccess(object? entity, string entityName, Guid currentUserId)
        {
            if (entity is null) return null;
            if (string.Equals(entityName, "UserProfile", StringComparison.OrdinalIgnoreCase))
            {
                if (entity is not UserProfile up) return null;
                return up.UserId == currentUserId
                    ? null
                    : StatusCode(StatusCodes.Status403Forbidden, new { error = "Forbidden" });
            }

            if (!UserOwnedEntityNames.Contains(entityName)) return null;
            var p = entity.GetType().GetProperty("UserId");
            if (p?.GetValue(entity) is not Guid ownerId) return null;
            return ownerId == currentUserId
                ? null
                : StatusCode(StatusCodes.Status403Forbidden, new { error = "Forbidden" });
        }

        private static void ForceUserIdOnNewEntity(object entity, Guid userId)
        {
            switch (entity)
            {
                case BabyActivity ba: ba.UserId = userId; break;
                case BabyMood bm: bm.UserId = userId; break;
                case BabyProfile bp: bp.UserId = userId; break;
                case JournalEntry je: je.UserId = userId; break;
                case MeditationSession ms: ms.UserId = userId; break;
                case MoodEntry me: me.UserId = userId; break;
                case SavedResource sr: sr.UserId = userId; break;
                case SupportRequest sreq: sreq.UserId = userId; break;
                case AffirmationReaction ar: ar.UserId = userId; break;
                case SupportProfile sp: sp.UserId = userId; break;
            }
        }

        private async Task<IActionResult?> ValidateBabyCreateReferencesAsync(object entity)
        {
            switch (entity)
            {
                case BabyActivity ba:
                {
                    var bp = await _context.BabyProfiles.AsNoTracking()
                        .FirstOrDefaultAsync(b => b.BabyId == ba.BabyId).ConfigureAwait(false);
                    if (bp == null || bp.UserId != ba.UserId)
                        return BadRequest(new { error = "baby_id does not belong to the signed-in user" });
                    break;
                }
                case BabyMood bm:
                {
                    var bp = await _context.BabyProfiles.AsNoTracking()
                        .FirstOrDefaultAsync(b => b.BabyId == bm.BabyId).ConfigureAwait(false);
                    if (bp == null || bp.UserId != bm.UserId)
                        return BadRequest(new { error = "baby_id does not belong to the signed-in user" });
                    break;
                }
            }

            return null;
        }

        private object? GetDbSet(string entityName)
        {
            if (!EntityMap.TryGetValue(entityName, out var dbSetName))
                return null;

            var prop = typeof(FlourishDbContext).GetProperty(dbSetName);
            return prop?.GetValue(_context);
        }

        private static PropertyInfo? FindProperty(Type entityType, string snakeCaseName)
        {
            // Try exact match first (PascalCase)
            var prop = entityType.GetProperty(snakeCaseName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
            if (prop != null) return prop;

            // Convert snake_case to PascalCase and try again
            var pascalCase = string.Join("",
                snakeCaseName.Split('_')
                    .Where(s => !string.IsNullOrEmpty(s))
                    .Select(s => char.ToUpper(s[0]) + s.Substring(1).ToLower()));

            return entityType.GetProperty(pascalCase, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
        }

        private static object? ConvertJsonElement(JsonElement element, Type targetType)
        {
            var underlyingType = Nullable.GetUnderlyingType(targetType) ?? targetType;

            if (element.ValueKind == JsonValueKind.Null)
            {
                if (underlyingType == typeof(List<string>))
                    return new List<string>();
                return null;
            }

            if (underlyingType == typeof(string))
                return element.GetString();
            if (underlyingType == typeof(int))
                return element.GetInt32();
            if (underlyingType == typeof(long))
                return element.GetInt64();
            if (underlyingType == typeof(double))
                return element.GetDouble();
            if (underlyingType == typeof(float))
                return element.GetSingle();
            if (underlyingType == typeof(bool))
                return element.GetBoolean();
            if (underlyingType == typeof(Guid))
                return Guid.Parse(element.GetString()!);
            if (underlyingType == typeof(DateTime))
                return element.GetDateTime();
            if (underlyingType == typeof(List<string>))
            {
                return element.EnumerateArray()
                    .Select(e => e.GetString() ?? "")
                    .ToList();
            }

            return null;
        }

        private static IQueryable ApplyWherePropertyEquals(
            IQueryable source,
            Type entityType,
            PropertyInfo prop,
            object targetValue)
        {
            var method = typeof(EntitiesController).GetMethod(
                nameof(WherePropertyEqualsImpl),
                BindingFlags.NonPublic | BindingFlags.Static);
            var generic = method!.MakeGenericMethod(entityType);
            return (IQueryable)generic.Invoke(null, new object[] { source, prop, targetValue })!;
        }

        private static IQueryable WherePropertyEqualsImpl<TEntity>(
            IQueryable source,
            PropertyInfo prop,
            object targetValue) where TEntity : class
        {
            var query = (IQueryable<TEntity>)source;
            var param = Expression.Parameter(typeof(TEntity), "e");
            var propertyAccess = Expression.Call(
                typeof(EF),
                nameof(EF.Property),
                new[] { prop.PropertyType },
                param,
                Expression.Constant(prop.Name));
            var constant = Expression.Constant(targetValue, prop.PropertyType);
            var equals = Expression.Equal(propertyAccess, constant);
            var lambda = Expression.Lambda<Func<TEntity, bool>>(equals, param);
            return Queryable.Where(query, lambda);
        }

        private static IQueryable ApplyOrderByProperty(
            IQueryable source,
            Type entityType,
            PropertyInfo prop,
            bool descending)
        {
            var method = typeof(EntitiesController).GetMethod(
                nameof(OrderByPropertyImpl),
                BindingFlags.NonPublic | BindingFlags.Static);
            var generic = method!.MakeGenericMethod(entityType);
            return (IQueryable)generic.Invoke(null, new object[] { source, prop, descending })!;
        }

        private static IQueryable OrderByPropertyImpl<TEntity>(
            IQueryable source,
            PropertyInfo prop,
            bool descending) where TEntity : class
        {
            var query = (IQueryable<TEntity>)source;
            var param = Expression.Parameter(typeof(TEntity), "e");
            var keyAccess = Expression.Call(
                typeof(EF),
                nameof(EF.Property),
                new[] { prop.PropertyType },
                param,
                Expression.Constant(prop.Name));
            var delegateType = typeof(Func<,>).MakeGenericType(typeof(TEntity), prop.PropertyType);
            var lambda = Expression.Lambda(delegateType, keyAccess, param);

            var methodName = descending ? nameof(Queryable.OrderByDescending) : nameof(Queryable.OrderBy);
            MethodInfo? orderBy = null;
            foreach (var m in typeof(Queryable).GetMethods(BindingFlags.Public | BindingFlags.Static))
            {
                if (m.Name != methodName || !m.IsGenericMethodDefinition) continue;
                var ps = m.GetParameters();
                if (ps.Length != 2) continue;
                if (!ps[1].ParameterType.IsGenericType) continue;
                if (ps[1].ParameterType.GetGenericTypeDefinition() != typeof(Expression<>)) continue;
                orderBy = m;
                break;
            }

            if (orderBy == null)
                throw new InvalidOperationException($"Could not resolve {methodName}.");

            var genericOrderBy = orderBy.MakeGenericMethod(typeof(TEntity), prop.PropertyType);
            return (IQueryable)genericOrderBy.Invoke(null, new object[] { query, lambda })!;
        }

        private static IQueryable ApplySkip(IQueryable source, Type entityType, int count)
        {
            return (IQueryable)typeof(Queryable).GetMethods(BindingFlags.Public | BindingFlags.Static)
                .First(m => m.Name == nameof(Queryable.Skip) && m.IsGenericMethodDefinition &&
                            m.GetParameters().Length == 2 && m.GetParameters()[1].ParameterType == typeof(int))
                .MakeGenericMethod(entityType)
                .Invoke(null, new object[] { source, count })!;
        }

        private static IQueryable ApplyTake(IQueryable source, Type entityType, int count)
        {
            return (IQueryable)typeof(Queryable).GetMethods(BindingFlags.Public | BindingFlags.Static)
                .First(m => m.Name == nameof(Queryable.Take) && m.IsGenericMethodDefinition &&
                            m.GetParameters().Length == 2 && m.GetParameters()[1].ParameterType == typeof(int))
                .MakeGenericMethod(entityType)
                .Invoke(null, new object[] { source, count })!;
        }

        private static async Task<object> ExecuteToListAsync(IQueryable query, Type elementType)
        {
            MethodInfo? toListAsync = null;
            foreach (var m in typeof(EntityFrameworkQueryableExtensions).GetMethods(BindingFlags.Public | BindingFlags.Static))
            {
                if (m.Name != nameof(EntityFrameworkQueryableExtensions.ToListAsync)) continue;
                if (!m.IsGenericMethodDefinition) continue;
                var ps = m.GetParameters();
                if (ps.Length != 2 || ps[1].ParameterType != typeof(CancellationToken)) continue;
                var p0 = ps[0].ParameterType;
                if (!p0.IsGenericType || p0.GetGenericTypeDefinition() != typeof(IQueryable<>)) continue;
                toListAsync = m;
                break;
            }

            if (toListAsync == null)
                throw new InvalidOperationException("EF ToListAsync not found.");

            var gm = toListAsync.MakeGenericMethod(elementType);
            var task = (Task)gm.Invoke(null, new object[] { query, CancellationToken.None })!;
            await task.ConfigureAwait(false);
            return task.GetType().GetProperty("Result")!.GetValue(task)!;
        }
    }
}
