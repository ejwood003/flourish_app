using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class UserProfile
    {
        [Key]
        public Guid UserId { get; set; } = Guid.NewGuid();

        public string Username { get; set; }

        public string UserFirstName { get; set; }

        public string UserLastName { get; set; }

        public string Password { get; set; }

        public string PhoneNumber { get; set; }

        public bool NotificationsMoodEnabled { get; set; }

        public List<string> NotificationsMoodTimes { get; set; }

        public bool NotificationsFeedingEnabled { get; set; }

        public List<string> NotificationsFeedingTimes { get; set; }

        public bool NotificationsNapEnabled { get; set; }

        public List<string> NotificationsNapTimes { get; set; }

        // Represents the selected home features as a list of strings
        public List<string> HomeFeatures { get; set; } = new List<string> 
        { 
            "affirmation", "mood", "mood_chips", "mindfulness", "tasks", 
            "baby", "support", "breathing", "journal", "meditations", "articles" 
        };

    }
}
