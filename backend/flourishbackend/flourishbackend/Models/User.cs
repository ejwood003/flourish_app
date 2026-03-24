using System;
using System.ComponentModel.DataAnnotations;

namespace Flourish.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
