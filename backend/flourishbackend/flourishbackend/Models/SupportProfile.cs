using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Flourish.Models
{
    public class SupportProfile
    {
        [Key]
        public Guid SupportId { get; set; } = Guid.NewGuid();

        public string? SupportType { get; set; }

        public string? SupportName { get; set; }

        public string? SupportEmail { get; set; }

        public string? SupportPhone { get; set; }

        public bool ShareJournals { get; set; } = false;

        public bool ShareMood { get; set; } = false;

        public bool ShareBabyTracking { get; set; } = false;

        [Required]
        [ForeignKey("UserProfile")]
        public Guid UserId { get; set; }

        public UserProfile UserProfile { get; set; }
    }
}
