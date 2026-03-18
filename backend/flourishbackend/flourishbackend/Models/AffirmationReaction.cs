using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class AffirmationReaction
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string AffirmationId { get; set; } = string.Empty;

        [Required]
        public string Reaction { get; set; } = string.Empty; // 'up' or 'down'
    }
}
