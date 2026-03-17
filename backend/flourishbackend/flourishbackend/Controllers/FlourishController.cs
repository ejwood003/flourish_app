using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using flourishbackend.Data;

namespace flourishbackend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class FlourishController : ControllerBase
    {
        private FlourishDbContext _context;

        public FlourishController(FlourishDbContext temp) {
            _context = temp;
        }
    }
}
