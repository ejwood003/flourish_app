using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class CustomAffirmation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string Text { get; set; } = string.Empty;
    }
}
