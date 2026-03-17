using Microsoft.EntityFrameworkCore;

namespace flourishbackend.Data
{
    public class FlourishDbContext: DbContext
    {
        public FlourishDbContext(DbContextOptions<FlourishDbContext> options) : base(options) { 
        
        }

        //heres where i would put Dbset stuff if I had any idea what database stuff we are working with
    }
}
