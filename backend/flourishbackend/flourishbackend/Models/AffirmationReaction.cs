using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Flourish.Models
{
    public class AffirmationReaction
    {
        [Key]
        public Guid AffirmationReactionId { get; set; } = Guid.NewGuid();

        [Required]
        [ForeignKey("Affirmation")]
        public Guid AffirmationId { get; set; }

        public Affirmation Affirmation { get; set; }

        [Required]
        public string Reaction { get; set; } = string.Empty; // 'up' or 'down'

        [Required]
        [ForeignKey("UserProfile")]
        public Guid UserId { get; set; }

        public UserProfile UserProfile { get; set; }
    }
}

