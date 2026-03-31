using Flourish.Models;
using Microsoft.EntityFrameworkCore;

namespace flourishbackend.Data;

/// <summary>
/// Inserts a predictable local-dev user if missing, so FKs (e.g. MoodEntry.UserId → UserProfile) succeed.
/// </summary>
public static class DevUserSeed
{
    /// <summary>Stable id you can paste into the frontend for quick testing.</summary>
    public static readonly Guid DevUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    /// <summary>Stable baby row so BabyActivity / BabyMood FKs succeed in local dev.</summary>
    public static readonly Guid DevBabyId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    /// <summary>Email for the seeded developer account (sign-in uses email + password).</summary>
    public const string DevUserEmail = "developer@flourish.local";

    /// <summary>Second stable dev account for multi-user testing.</summary>
    public static readonly Guid SecondTestUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    public const string SecondTestUserEmail = "test2@flourish.local";

    public static void EnsureDevUser(FlourishDbContext db)
    {
        if (db.UserProfiles.AsNoTracking().Any(u => u.UserId == DevUserId))
            return;

        db.UserProfiles.Add(new UserProfile
        {
            UserId = DevUserId,
            Username = "dev_seeduser",
            Email = DevUserEmail,
            UserFirstName = "Dev",
            UserLastName = "Seed",
            Password = "dev",
            PhoneNumber = "",
            NotificationsMoodEnabled = false,
            NotificationsMoodTimes = [],
            NotificationsFeedingEnabled = false,
            NotificationsFeedingTimes = [],
            NotificationsNapEnabled = false,
            NotificationsNapTimes = [],
            HomeFeatures =
            [
                "affirmation", "mood", "mood_chips", "mindfulness", "tasks",
                "baby", "support", "breathing", "journal", "meditations", "articles",
            ],
        });

        db.SaveChanges();
    }

    public static void EnsureSecondTestUser(FlourishDbContext db)
    {
        if (db.UserProfiles.AsNoTracking().Any(u => u.UserId == SecondTestUserId))
            return;

        db.UserProfiles.Add(new UserProfile
        {
            UserId = SecondTestUserId,
            Username = "testuser2",
            Email = SecondTestUserEmail,
            UserFirstName = "Test",
            UserLastName = "UserTwo",
            Password = "dev",
            PhoneNumber = "",
            NotificationsMoodEnabled = false,
            NotificationsMoodTimes = [],
            NotificationsFeedingEnabled = false,
            NotificationsFeedingTimes = [],
            NotificationsNapEnabled = false,
            NotificationsNapTimes = [],
            HomeFeatures =
            [
                "affirmation", "mood", "mood_chips", "mindfulness", "tasks",
                "baby", "support", "breathing", "journal", "meditations", "articles",
            ],
        });

        db.SaveChanges();
    }

    /// <summary>Fills <see cref="UserProfile.Email"/> on the dev row if it was created before that column existed.</summary>
    public static void EnsureDevUserEmail(FlourishDbContext db)
    {
        var dev = db.UserProfiles.FirstOrDefault(u => u.UserId == DevUserId);
        if (dev == null)
            return;

        var changed = false;
        if (string.IsNullOrWhiteSpace(dev.Email))
        {
            dev.Email = DevUserEmail;
            changed = true;
        }

        if (changed)
            db.SaveChanges();
    }

    /// <summary>Fills <see cref="UserProfile.Email"/> on the second test row if missing.</summary>
    public static void EnsureSecondTestUserEmail(FlourishDbContext db)
    {
        var row = db.UserProfiles.FirstOrDefault(u => u.UserId == SecondTestUserId);
        if (row == null)
            return;

        if (!string.IsNullOrWhiteSpace(row.Email))
            return;

        row.Email = SecondTestUserEmail;
        db.SaveChanges();
    }

    public static void EnsureDevBabyProfile(FlourishDbContext db)
    {
        if (db.BabyProfiles.AsNoTracking().Any(b => b.BabyId == DevBabyId))
            return;

        db.BabyProfiles.Add(new BabyProfile
        {
            BabyId = DevBabyId,
            BabyName = "Baby",
            BabyDateOfBirth = new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            UserId = DevUserId,
        });

        db.SaveChanges();
    }

    public static void EnsureDevAffirmations(FlourishDbContext db)
    {
        // Seed once (by exact text match) so local dev stays stable across restarts.
        var texts = GetDevAffirmationTexts();
        var existing = db.Affirmations.AsNoTracking()
            .Where(a => texts.Contains(a.Text))
            .Select(a => a.Text)
            .ToHashSet(StringComparer.Ordinal);

        var toAdd = texts
            .Where(t => !existing.Contains(t))
            .Select(t => new Affirmation { Text = t })
            .ToList();

        if (toAdd.Count == 0) return;
        db.Affirmations.AddRange(toAdd);
        db.SaveChanges();
    }

    public static void EnsureDevAffirmationReactions(FlourishDbContext db)
    {
        // Requires affirmations to exist.
        var affirmations = db.Affirmations.AsNoTracking()
            .OrderBy(a => a.Text)
            .Take(10)
            .ToList();
        if (affirmations.Count == 0) return;

        // Seed only if the dev user has no reactions yet (keep it simple + idempotent).
        if (db.AffirmationReactions.AsNoTracking().Any(r => r.UserId == DevUserId))
            return;

        var picks = affirmations.Take(5).ToList();
        var reactions = new[]
        {
            "up","up","up","down","up"
        };

        var toAdd = picks.Select((a, i) => new AffirmationReaction
        {
            AffirmationId = a.AffirmationId,
            UserId = DevUserId,
            Reaction = reactions[i]
        }).ToList();

        db.AffirmationReactions.AddRange(toAdd);
        db.SaveChanges();
    }

    public static void EnsureDevJournalEntries(FlourishDbContext db)
    {
        if (db.JournalEntries.AsNoTracking().Any(j => j.UserId == DevUserId))
            return;

        var now = DateTime.UtcNow;
        db.JournalEntries.AddRange(
            new JournalEntry
            {
                UserId = DevUserId,
                CreatedDate = now.AddDays(-2),
                Prompt = "What’s one small win from today?",
                Content = "I took a short walk and felt a little more grounded afterward.",
                ShareWithPartner = false
            },
            new JournalEntry
            {
                UserId = DevUserId,
                CreatedDate = now.AddDays(-1),
                Prompt = "What do you need more of this week?",
                Content = "More rest, more water, and asking for help sooner instead of pushing through.",
                ShareWithPartner = true
            }
        );

        db.SaveChanges();
    }

    public static void EnsureDevMoodEntries(FlourishDbContext db)
    {
        // Ensure 14 entries across 14 distinct days for the dev user.
        var existingDates = db.MoodEntries.AsNoTracking()
            .Where(m => m.UserId == DevUserId)
            .Select(m => m.Date)
            .ToHashSet(StringComparer.Ordinal);

        var toAdd = new List<MoodEntry>();
        var today = DateTime.UtcNow.Date;
        for (var i = 0; i < 14; i++)
        {
            var day = today.AddDays(-i);
            var date = day.ToString("yyyy-MM-dd");
            if (existingDates.Contains(date))
                continue;

            // A simple repeating pattern so charts look interesting.
            var moodValue = 45 + (i * 4 % 45); // 45..89
            var label = moodValue switch
            {
                >= 80 => "Great",
                >= 65 => "Good",
                >= 50 => "Okay",
                _ => "Low"
            };

            toAdd.Add(new MoodEntry
            {
                UserId = DevUserId,
                Date = date,
                Time = "09:00",
                MoodValue = moodValue,
                MoodLabel = label
            });
        }

        if (toAdd.Count == 0) return;
        db.MoodEntries.AddRange(toAdd);
        db.SaveChanges();
    }

    private static HashSet<string> GetDevAffirmationTexts() => new(StringComparer.Ordinal)
    {
        "I am doing my best, and that is enough.",
        "Small steps still move me forward.",
        "I can handle what comes next.",
        "I give myself permission to rest.",
        "My feelings are valid, and they will pass.",
        "I am learning as I go.",
        "I deserve support and kindness.",
        "I trust myself to make good decisions.",
        "I can start again at any moment.",
        "Today, I will focus on what I can control."
    };

    // ── Realistic demo users with 14+ day history ─────────────────────────────

    public static readonly Guid DemoUserAId = Guid.Parse("a0a0a0a0-0000-0000-0000-000000000001");
    public static readonly Guid DemoUserBId = Guid.Parse("a0a0a0a0-0000-0000-0000-000000000002");
    public static readonly Guid DemoUserCId = Guid.Parse("a0a0a0a0-0000-0000-0000-000000000003");
    public static readonly Guid DemoUserDId = Guid.Parse("a0a0a0a0-0000-0000-0000-000000000004");

    /// <summary>
    /// Seeds 4 users who joined 18-30 days ago with realistic mood entries spread
    /// across their first 10 days and after day 14, plus meditation sessions in week 1.
    /// Expected KR outcomes: KR1=75%, KR2=100% (demo cohort), KR3 avg ~54% lift.
    /// </summary>
    public static void EnsureDemoUsers(FlourishDbContext db)
    {
        EnsureDemoUserA(db);
        EnsureDemoUserB(db);
        EnsureDemoUserC(db);
        EnsureDemoUserD(db);
    }

    // User A: joined 30 days ago, steady improver, meditation day 2
    private static void EnsureDemoUserA(FlourishDbContext db)
    {
        if (db.UserProfiles.AsNoTracking().Any(u => u.UserId == DemoUserAId)) return;
        var created = DateTime.UtcNow.Date.AddDays(-30);
        var cu = new DateTime(created.Year, created.Month, created.Day, 10, 0, 0, DateTimeKind.Utc);
        db.UserProfiles.Add(new UserProfile
        {
            UserId = DemoUserAId, Username = "demo_sarah", Email = "sarah@flourish.demo",
            UserFirstName = "Sarah", UserLastName = "M.", Password = "demo", CreatedDate = cu,
            HomeFeatures = ["affirmation","mood","mood_chips","mindfulness","tasks","baby","support","breathing","journal","meditations","articles"],
            NotificationsMoodTimes = ["09:00"],
        });
        // Baseline days 1-3 avg=42.3 | Post day-14+ avg=63.7 | Improvement ~50%
        (int d, int v)[] m = [(1,45),(2,40),(3,42),(4,48),(5,50),(15,60),(16,65),(17,62),(18,63),(19,68),(20,65)];
        foreach (var (d, v) in m)
            db.MoodEntries.Add(new MoodEntry { UserId = DemoUserAId, Date = created.AddDays(d-1).ToString("yyyy-MM-dd"), MoodValue = v });
        db.MeditationSessions.Add(new MeditationSession
        {
            MeditationSessionId = Guid.Parse("b0b0b0b0-0000-0000-0000-000000000001"),
            UserId = DemoUserAId, MeditationId = "med2", MeditationTitle = "Feeding Time Presence",
            DurationMinutes = 5, PercentComplete = 100, CompletedAt = cu.AddDays(1),
        });
        db.SaveChanges();
    }

    // User B: joined 24 days ago, big improver, meditation day 4
    private static void EnsureDemoUserB(FlourishDbContext db)
    {
        if (db.UserProfiles.AsNoTracking().Any(u => u.UserId == DemoUserBId)) return;
        var created = DateTime.UtcNow.Date.AddDays(-24);
        var cu = new DateTime(created.Year, created.Month, created.Day, 9, 0, 0, DateTimeKind.Utc);
        db.UserProfiles.Add(new UserProfile
        {
            UserId = DemoUserBId, Username = "demo_jessica", Email = "jessica@flourish.demo",
            UserFirstName = "Jessica", UserLastName = "T.", Password = "demo", CreatedDate = cu,
            HomeFeatures = ["affirmation","mood","mood_chips","mindfulness","tasks","baby","support","breathing","journal","meditations","articles"],
            NotificationsMoodTimes = ["09:00"],
        });
        // Baseline days 1-3 avg=32.3 | Post day-14+ avg=58.6 | Improvement ~81%
        (int d, int v)[] m = [(1,30),(2,35),(3,32),(4,40),(5,38),(15,55),(16,58),(17,60),(18,58),(19,62)];
        foreach (var (d, v) in m)
            db.MoodEntries.Add(new MoodEntry { UserId = DemoUserBId, Date = created.AddDays(d-1).ToString("yyyy-MM-dd"), MoodValue = v });
        db.MeditationSessions.Add(new MeditationSession
        {
            MeditationSessionId = Guid.Parse("b0b0b0b0-0000-0000-0000-000000000002"),
            UserId = DemoUserBId, MeditationId = "med4", MeditationTitle = "Release and Let Go",
            DurationMinutes = 10, PercentComplete = 100, CompletedAt = cu.AddDays(3),
        });
        db.SaveChanges();
    }

    // User C: joined 19 days ago, moderate improver, meditation day 3
    private static void EnsureDemoUserC(FlourishDbContext db)
    {
        if (db.UserProfiles.AsNoTracking().Any(u => u.UserId == DemoUserCId)) return;
        var created = DateTime.UtcNow.Date.AddDays(-19);
        var cu = new DateTime(created.Year, created.Month, created.Day, 8, 0, 0, DateTimeKind.Utc);
        db.UserProfiles.Add(new UserProfile
        {
            UserId = DemoUserCId, Username = "demo_amy", Email = "amy@flourish.demo",
            UserFirstName = "Amy", UserLastName = "R.", Password = "demo", CreatedDate = cu,
            HomeFeatures = ["affirmation","mood","mood_chips","mindfulness","tasks","baby","support","breathing","journal","meditations","articles"],
            NotificationsMoodTimes = ["08:00"],
        });
        // Baseline days 1-3 avg=55 | Post day-14+ avg=71.8 | Improvement ~30.5%
        (int d, int v)[] m = [(1,55),(2,52),(3,58),(5,60),(7,65),(15,70),(16,72),(17,75),(18,70)];
        foreach (var (d, v) in m)
            db.MoodEntries.Add(new MoodEntry { UserId = DemoUserCId, Date = created.AddDays(d-1).ToString("yyyy-MM-dd"), MoodValue = v });
        db.MeditationSessions.Add(new MeditationSession
        {
            MeditationSessionId = Guid.Parse("b0b0b0b0-0000-0000-0000-000000000003"),
            UserId = DemoUserCId, MeditationId = "med1", MeditationTitle = "Breath of Calm",
            DurationMinutes = 5, PercentComplete = 100, CompletedAt = cu.AddDays(2),
        });
        db.SaveChanges();
    }

    // User D: joined 18 days ago, skipped week-1 meditation (KR1 miss for realism)
    private static void EnsureDemoUserD(FlourishDbContext db)
    {
        if (db.UserProfiles.AsNoTracking().Any(u => u.UserId == DemoUserDId)) return;
        var created = DateTime.UtcNow.Date.AddDays(-18);
        var cu = new DateTime(created.Year, created.Month, created.Day, 11, 0, 0, DateTimeKind.Utc);
        db.UserProfiles.Add(new UserProfile
        {
            UserId = DemoUserDId, Username = "demo_olivia", Email = "olivia@flourish.demo",
            UserFirstName = "Olivia", UserLastName = "K.", Password = "demo", CreatedDate = cu,
            HomeFeatures = ["affirmation","mood","mood_chips","mindfulness","tasks","baby","support","breathing","journal","meditations","articles"],
            NotificationsMoodTimes = ["11:00"],
        });
        // Baseline days 1-3 avg=27.7 | Post day-14+ avg=47.7 | Improvement ~72%
        // No week-1 meditation -- intentional KR1 miss
        (int d, int v)[] m = [(1,25),(2,30),(3,28),(15,45),(16,50),(17,48)];
        foreach (var (d, v) in m)
            db.MoodEntries.Add(new MoodEntry { UserId = DemoUserDId, Date = created.AddDays(d-1).ToString("yyyy-MM-dd"), MoodValue = v });
        // Meditated on day 9 (outside KR1 window, but still a valid session record)
        db.MeditationSessions.Add(new MeditationSession
        {
            MeditationSessionId = Guid.Parse("b0b0b0b0-0000-0000-0000-000000000004"),
            UserId = DemoUserDId, MeditationId = "med7", MeditationTitle = "Strength in Moments",
            DurationMinutes = 5, PercentComplete = 100, CompletedAt = cu.AddDays(8),
        });
        db.SaveChanges();
    }
}
