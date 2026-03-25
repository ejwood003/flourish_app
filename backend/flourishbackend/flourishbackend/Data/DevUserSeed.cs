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
}
