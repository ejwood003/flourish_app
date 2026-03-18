using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class BabyActivity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string Type { get; set; } = string.Empty; // 'breastfeed', 'bottle', 'nap'

        public DateTime Timestamp { get; set; }

        public int? DurationMinutes { get; set; }

        public string? Notes { get; set; }

        public string? BreastSide { get; set; } // 'left', 'right', 'both'
    }
}
