using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class MoodEntry
    {
        [Key]
        public Guid MoodEntryId { get; set; } = Guid.NewGuid();

        [Range(0, 100)]
        public int MoodValue { get; set; }

        public string Date { get; set; } = string.Empty; // YYYY-MM-DD

        public string? Time { get; set; } // HH:MM, optional

        public string? MoodLabel { get; set; } // 'Calm', 'Happy', optional

        [Required]
        [ForeignKey("UserProfile")]
        public Guid UserId { get; set; }

        public UserProfile UserProfile { get; set; }
    }
}
