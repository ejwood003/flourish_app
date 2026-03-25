using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using flourishbackend.Data;

namespace flourishbackend.Controllers
{
    [Route("api/apps/{appId}/entities/{entityName}")]
    [ApiController]
    public class EntitiesController : ControllerBase
    {
        private readonly FlourishDbContext _context;

        // Map frontend entity names to DbContext property names
        private static readonly Dictionary<string, string> EntityMap = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Affirmation"] = "Affirmations",
            ["AffirmationReaction"] = "AffirmationReactions",
            ["BabyActivity"] = "BabyActivities",
            ["BabyMood"] = "BabyMoods",
            ["BabyProfile"] = "BabyProfiles",
            ["JournalEntry"] = "JournalEntries",
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

        public EntitiesController(FlourishDbContext context)
        {
            _context = context;
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

            var entityType = EntityTypeMap[entityName];

            IQueryable query = (IQueryable)dbSet;

            // Apply filtering if q parameter is provided (must translate to SQL — no reflection GetValue in LINQ)
            if (!string.IsNullOrEmpty(q))
            {
                try
                {
                    var filterDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(q, _jsonOptions);
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
                }
                catch
                {
                    // Silently ignore malformed filter queries
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

            var entity = await _context.FindAsync(EntityTypeMap[entityName], guidId);
            if (entity == null) return NotFound(new { error = "Record not found" });

            var json = JsonSerializer.Serialize(entity, _jsonOptions);
            return Content(json, "application/json");
        }

        // POST: api/apps/{appId}/entities/{entityName}
        [HttpPost]
        public async Task<IActionResult> Create(string appId, string entityName)
        {
            var dbSet = GetDbSet(entityName);
            if (dbSet == null) return NotFound(new { error = $"Entity '{entityName}' not found" });

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

            var entityType = EntityTypeMap[entityName];
            var existing = await _context.FindAsync(entityType, guidId);
            if (existing == null) return NotFound(new { error = "Record not found" });

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

            var entity = await _context.FindAsync(EntityTypeMap[entityName], guidId);
            if (entity == null) return NotFound(new { error = "Record not found" });

            _context.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --- Helper Methods ---

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
