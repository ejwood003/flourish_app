using System.Reflection;
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
            ["AffirmationReaction"] = "AffirmationReactions",
            ["BabyActivity"] = "BabyActivities",
            ["BabyMood"] = "BabyMoods",
            ["CustomAffirmation"] = "CustomAffirmations",
            ["JournalEntry"] = "JournalEntries",
            ["MoodEntry"] = "MoodEntries",
            ["SavedResource"] = "SavedResources",
            ["SelectedSupportRequest"] = "SelectedSupportRequests",
            ["SupportRequest"] = "SupportRequests",
            ["User"] = "Users",
            ["UserProfile"] = "UserProfiles",
        };

        // Map entity names to their CLR types
        private static readonly Dictionary<string, Type> EntityTypeMap = new(StringComparer.OrdinalIgnoreCase)
        {
            ["AffirmationReaction"] = typeof(Flourish.Models.AffirmationReaction),
            ["BabyActivity"] = typeof(Flourish.Models.BabyActivity),
            ["BabyMood"] = typeof(Flourish.Models.BabyMood),
            ["CustomAffirmation"] = typeof(Flourish.Models.CustomAffirmation),
            ["JournalEntry"] = typeof(Flourish.Models.JournalEntry),
            ["MoodEntry"] = typeof(Flourish.Models.MoodEntry),
            ["SavedResource"] = typeof(Flourish.Models.SavedResource),
            ["SelectedSupportRequest"] = typeof(Flourish.Models.SelectedSupportRequest),
            ["SupportRequest"] = typeof(Flourish.Models.SupportRequest),
            ["User"] = typeof(Flourish.Models.User),
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

            // Get all items as a queryable
            IQueryable<object> query = (IQueryable<object>)dbSet;

            // Apply filtering if q parameter is provided
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
                            if (propInfo != null)
                            {
                                var targetValue = ConvertJsonElement(value, propInfo.PropertyType);
                                if (targetValue != null)
                                {
                                    query = query.Where(e => propInfo.GetValue(e)!.Equals(targetValue));
                                }
                            }
                        }
                    }
                }
                catch
                {
                    // Silently ignore malformed filter queries
                }
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(sort))
            {
                bool descending = sort.StartsWith("-");
                string sortField = sort.TrimStart('-', '+');
                var propInfo = FindProperty(entityType, sortField);
                if (propInfo != null)
                {
                    if (descending)
                        query = query.OrderByDescending(e => EF.Property<object>(e, propInfo.Name));
                    else
                        query = query.OrderBy(e => EF.Property<object>(e, propInfo.Name));
                }
            }

            // Apply skip and limit
            if (skip.HasValue) query = query.Skip(skip.Value);
            if (limit.HasValue) query = query.Take(limit.Value);

            var results = await query.ToListAsync();

            // Serialize with snake_case
            var json = JsonSerializer.Serialize(results, _jsonOptions);
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

            // Ensure a new GUID is set for the Id
            var idProp = entityType.GetProperty("Id");
            if (idProp != null)
            {
                idProp.SetValue(entity, Guid.NewGuid());
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
                    key.Equals("created_date", StringComparison.OrdinalIgnoreCase))
                    continue;

                var propInfo = FindProperty(entityType, key);
                if (propInfo != null && propInfo.CanWrite)
                {
                    try
                    {
                        var convertedValue = ConvertJsonElement(value, propInfo.PropertyType);
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
                return null;

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
    }
}
