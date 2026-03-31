using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Flourish.Models
{
    public class MeditationSession
    {
        [Key]
        public Guid MeditationSessionId { get; set; } = Guid.NewGuid();

        /// <summary>Frontend meditation id, e.g. "med1", "med2".</summary>
        public string? MeditationId { get; set; }

        public string? MeditationTitle { get; set; }

        public int DurationMinutes { get; set; }

        /// <summary>UTC timestamp when the session was completed (or abandoned).</summary>
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

        /// <summary>0–100. 100 = fully completed.</summary>
        [Range(0, 100)]
        public int PercentComplete { get; set; } = 100;

        [Required]
        [ForeignKey("UserProfile")]
        public Guid UserId { get; set; }

        [JsonIgnore]
        public UserProfile UserProfile { get; set; } = null!;
    }
}
