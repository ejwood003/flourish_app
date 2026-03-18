using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class SupportRequest
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string RequestText { get; set; } = string.Empty;

        public bool IsCustom { get; set; } = false;
    }
}
