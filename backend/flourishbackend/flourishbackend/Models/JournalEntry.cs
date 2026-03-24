using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        [Required]
        [ForeignKey("UserProfile")]
        public Guid UserId { get; set; }

        public UserProfile UserProfile { get; set; }
    }
}
