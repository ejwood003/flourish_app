using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class UserProfile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Username { get; set; }

        public string User_First_Name { get; set; }

        public string User_Last_Name { get; set; }

        public string password { get; set; }

        public string Phone_Number { get; set; }

        public bool Notifications_Mood_Enabled { get; set; }

        public List<string> Notifications_Mood_Times { get; set; }

        public bool Notifications_Feeding_Enabled { get; set; }

        public List<string> Notifications_Feeding_Times { get; set; }

        public bool Notifications_Nap_Enabled { get; set; }

        public List<string> Notifications_Feeding_Times { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Represents the selected home features as a list of strings
        public List<string> HomeFeatures { get; set; } = new List<string> 
        { 
            "affirmation", "mood", "mood_chips", "mindfulness", "tasks", 
            "baby", "support", "breathing", "journal", "meditations", "articles" 
        };

        public string SupportName { get; set; } = "your partner";
    }
}
