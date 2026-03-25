using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Flourish.Models
{
    public class BabyProfile
    {
        [Key]
        public Guid BabyId { get; set; } = Guid.NewGuid();

        public string BabyName { get; set; }

        public DateTime BabyDateOfBirth { get; set; }

        [Required]
        [ForeignKey("UserProfile")]
        public Guid UserId { get; set; }

        public UserProfile UserProfile { get; set; }
    }
}
