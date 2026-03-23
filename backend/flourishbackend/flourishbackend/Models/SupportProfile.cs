using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class SupportProfile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string Support_Type { get; set; }

        public string Support_Name { get; set; }

        public string Support_Email { get; set; }

        public string Support_Phone { get; set; }

        public bool Share_Journals { get; set; }

        public bool Share_Mood { get; set; }

        public bool Share_Baby_Tracking { get; set; }
    }
}
