using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Flourish.Models
{
    public class BabyActivity
    {
        [Key]
        public Guid BabyActivityId { get; set; } = Guid.NewGuid();

        [Required]
        public string Type { get; set; } = string.Empty; // 'breastfeed', 'bottle', 'nap'

        public DateTime Timestamp { get; set; }

        public int? DurationMinutes { get; set; }

        public string? Notes { get; set; }

        public string? BreastSide { get; set; } // 'left', 'right', 'both'

        public float? AmountOz { get; set; }

        public string? FoodType { get; set; }

        public string? FoodAmount { get; set; }

        public string? CustomType { get; set; }

        [Required]
        [ForeignKey("BabyProfile")]
        public Guid BabyId { get; set; }

        public BabyProfile BabyProfile { get; set; }
    }
}
