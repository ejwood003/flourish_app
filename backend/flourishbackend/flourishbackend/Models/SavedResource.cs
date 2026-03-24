using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Flourish.Models
{
    public class SavedResource
    {
        [Key]
        public Guid SavedResourceId { get; set; } = Guid.NewGuid();

        [Required]
        public string ResourceId { get; set; } = string.Empty;

        [Required]
        public string ResourceType { get; set; } = string.Empty; // 'meditation', 'article', 'tip'

        [Required]
        [ForeignKey("UserProfile")]
        public Guid UserId { get; set; }

        public UserProfile UserProfile { get; set; }
    }
}
