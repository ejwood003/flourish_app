using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class SavedResource
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string ResourceId { get; set; } = string.Empty;

        [Required]
        public string ResourceType { get; set; } = string.Empty; // 'meditation', 'article', 'tip'
    }
}
