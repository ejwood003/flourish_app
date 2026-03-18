using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Flourish.Models;

namespace flourishbackend.Data
{
    public class FlourishDbContext: DbContext
    {
        public FlourishDbContext(DbContextOptions<FlourishDbContext> options) : base(options) { 
        
        }

        public DbSet<AffirmationReaction> AffirmationReactions { get; set; }
        public DbSet<BabyActivity> BabyActivities { get; set; }
        public DbSet<BabyMood> BabyMoods { get; set; }
        public DbSet<CustomAffirmation> CustomAffirmations { get; set; }
        public DbSet<JournalEntry> JournalEntries { get; set; }
        public DbSet<MoodEntry> MoodEntries { get; set; }
        public DbSet<SavedResource> SavedResources { get; set; }
        public DbSet<SelectedSupportRequest> SelectedSupportRequests { get; set; }
        public DbSet<SupportRequest> SupportRequests { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure List<string> properties to be stored as JSON in SQLite
            var stringListConverter = new ValueConverter<List<string>, string>(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
            );

            var stringListComparer = new ValueComparer<List<string>>(
                (c1, c2) => c1!.SequenceEqual(c2!),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList()
            );

            modelBuilder.Entity<BabyMood>()
                .Property(e => e.Tags)
                .HasConversion(stringListConverter)
                .Metadata.SetValueComparer(stringListComparer);

            modelBuilder.Entity<UserProfile>()
                .Property(e => e.HomeFeatures)
                .HasConversion(stringListConverter)
                .Metadata.SetValueComparer(stringListComparer);
        }
    }
}
