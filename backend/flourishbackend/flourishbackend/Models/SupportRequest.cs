using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Flourish.Models
{
    public class SupportRequest
    {
        [Key]
        public Guid SupportRequestId { get; set; } = Guid.NewGuid();

        [Required]
        public string RequestText { get; set; } = string.Empty;

        public bool IsCustom { get; set; } = false;

        [Required]
        [ForeignKey("UserProfile")]
        public Guid UserId { get; set; }

        public UserProfile UserProfile { get; set; }
    }
}
