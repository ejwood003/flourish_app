using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class SelectedSupportRequest
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string RequestText { get; set; } = string.Empty;

        [Required]
        public string SelectedDate { get; set; } = string.Empty; // YYYY-MM-DD
    }
}
