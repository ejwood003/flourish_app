using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Flourish.Models
{
    public class BabyMood
    {
        [Key]
        public Guid BabyMoodId { get; set; } = Guid.NewGuid();

        [Range(0, 100)]
        public int MoodValue { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public List<string> Tags { get; set; } = new List<string>(); // 'Calm', 'Happy', 'Fussy', etc.

        [Required]
        [ForeignKey("BabyProfile")]
        public Guid BabyId { get; set; }

        public BabyProfile BabyProfile { get; set; }
    }
}
