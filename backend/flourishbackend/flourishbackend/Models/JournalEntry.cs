using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Flourish.Models
{
    public class JournalEntry
    {
        [Key]
        public Guid JournalEntryId { get; set; } = Guid.NewGuid();

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? Prompt { get; set; }

        public bool ShareWithPartner { get; set; } = false;

        [JsonPropertyName("created_date")]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        [ForeignKey("UserProfile")]
        public Guid UserId { get; set; }

        [JsonIgnore]
        public UserProfile UserProfile { get; set; }
    }
}
