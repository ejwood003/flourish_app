using Microsoft.AspNetCore.Mvc;

namespace flourishbackend.Controllers
{
    [Route("api/apps/public")]
    [ApiController]
    public class AppsPublicController : ControllerBase
    {
        [HttpGet("prod/public-settings/by-id/{appId}")]
        public IActionResult GetPublicSettings(string appId)
        {
            // The frontend expects { id, public_settings } and uses this to decide if auth is required.
            // For local/dev usage, we default to no auth required.
            return Ok(new
            {
                id = appId,
                public_settings = new
                {
                    requires_auth = false
                }
            });
        }
    }
}

