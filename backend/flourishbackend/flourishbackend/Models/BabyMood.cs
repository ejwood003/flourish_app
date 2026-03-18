using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class BabyMood
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Range(0, 100)]
        public int MoodValue { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public List<string> Tags { get; set; } = new List<string>(); // 'Calm', 'Happy', 'Fussy', etc.
    }
}
