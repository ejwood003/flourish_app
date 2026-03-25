using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class UserProfile
    {
        [Key]
        public Guid UserId { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        /// <summary>Optional link for partner flows (e.g. mother email on support-linked profiles).</summary>
        public string? CreatedBy { get; set; }

        private string _username = string.Empty;
        public string Username { get => _username; set => _username = value ?? string.Empty; }

        private string _userFirstName = string.Empty;
        public string UserFirstName { get => _userFirstName; set => _userFirstName = value ?? string.Empty; }

        private string _userLastName = string.Empty;
        public string UserLastName { get => _userLastName; set => _userLastName = value ?? string.Empty; }

        private string _password = string.Empty;
        public string Password { get => _password; set => _password = value ?? string.Empty; }

        private string _phoneNumber = string.Empty;
        public string PhoneNumber { get => _phoneNumber; set => _phoneNumber = value ?? string.Empty; }

        /// <summary>ISO date string from the client (e.g. yyyy-MM-dd).</summary>
        public string? DateOfBirth { get; set; }

        public string? BabyFullName { get; set; }
        public string? BabyDateOfBirth { get; set; }
        public string? BabyGender { get; set; }

        public string? SupportType { get; set; }
        public string SupportName { get; set; } = "your partner";
        public string? SupportEmail { get; set; }
        public string? SupportPhone { get; set; }

        public bool ShareJournals { get; set; }
        public bool ShareMood { get; set; }
        public bool ShareBabyTracking { get; set; }

        public bool NotificationsMoodEnabled { get; set; } = true;
        public List<string> NotificationsMoodTimes { get; set; } = new List<string> { "09:00" };
        public bool NotificationsFeedingEnabled { get; set; }
        public List<string> NotificationsFeedingTimes { get; set; } = new List<string>();
        public bool NotificationsNapEnabled { get; set; }
        public List<string> NotificationsNapTimes { get; set; } = new List<string>();

        public List<string> HomeFeatures { get; set; } = new List<string>
        {
            "affirmation", "mood", "mood_chips", "mindfulness", "tasks",
            "baby", "support", "breathing", "journal", "meditations", "articles"
        };

        /// <summary>
        /// Ensures list fields and defaults after partial JSON (e.g. settings-only create).
        /// </summary>
        public void EnsureDefaults()
        {
            if (string.IsNullOrWhiteSpace(SupportName))
                SupportName = "your partner";
            HomeFeatures ??= new List<string>
            {
                "affirmation", "mood", "mood_chips", "mindfulness", "tasks",
                "baby", "support", "breathing", "journal", "meditations", "articles"
            };
            NotificationsMoodTimes ??= new List<string> { "09:00" };
            NotificationsFeedingTimes ??= new List<string>();
            NotificationsNapTimes ??= new List<string>();
        }
    }
}
