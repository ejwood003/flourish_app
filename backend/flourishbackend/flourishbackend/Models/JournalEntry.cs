using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class JournalEntry
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? Prompt { get; set; }

        public bool ShareWithPartner { get; set; } = false;
    }
}
