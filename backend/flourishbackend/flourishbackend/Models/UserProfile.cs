using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class UserProfile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

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
