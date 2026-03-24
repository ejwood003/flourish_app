using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class BabyProfile
    {
        [Key]
        public Guid BabyId { get; set; } = Guid.NewGuid();

        public string BabyName { get; set; }

        public DateTime BabyDateOfBirth { get; set; }
    }
}
