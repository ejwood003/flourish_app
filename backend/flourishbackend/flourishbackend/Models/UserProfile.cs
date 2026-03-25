using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class UserProfile
    {
        [Key]
        public Guid UserId { get; set; } = Guid.NewGuid();

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

        public bool NotificationsMoodEnabled { get; set; }

        public List<string> NotificationsMoodTimes { get; set; } = new List<string>();

        public bool NotificationsFeedingEnabled { get; set; }

        public List<string> NotificationsFeedingTimes { get; set; } = new List<string>();

        public bool NotificationsNapEnabled { get; set; }

        public List<string> NotificationsNapTimes { get; set; } = new List<string>();

        public List<string> HomeFeatures { get; set; } = new List<string> 
        { 
            "affirmation", "mood", "mood_chips", "mindfulness", "tasks", 
            "baby", "support", "breathing", "journal", "meditations", "articles" 
        };

        public bool Share_Journals { get; set; }
        public bool Share_Mood { get; set; }
        public bool Share_Baby_Tracking { get; set; }

    }
}
