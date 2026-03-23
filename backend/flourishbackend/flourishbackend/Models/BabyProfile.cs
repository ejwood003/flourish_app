using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class BabyProfile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string Baby_Name { get; set; }

        public Date Baby_Date_of_Birth { get; set; }
    }
}
