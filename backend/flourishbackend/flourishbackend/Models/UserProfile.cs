using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class UserProfile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Username { get; set; } = string.Empty;

        public string User_First_Name { get; set; } = string.Empty;

        public string User_Last_Name { get; set; } = string.Empty;

        public string password { get; set; } = string.Empty;

        public string Phone_Number { get; set; } = string.Empty;

        public bool Notifications_Mood_Enabled { get; set; }

        public List<string> Notifications_Mood_Times { get; set; } = new List<string>();

        public bool Notifications_Feeding_Enabled { get; set; }

        public List<string> Notifications_Feeding_Times { get; set; } = new List<string>();

        public bool Notifications_Nap_Enabled { get; set; }

        public List<string> Notifications_Nap_Times { get; set; } = new List<string>();

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
