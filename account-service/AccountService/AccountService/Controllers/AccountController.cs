using AccountService.Interface;
using Microsoft.AspNetCore.Mvc;

namespace AccountService.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("authenticateSupplier")]
        public IActionResult AuthenticateSupplier([FromQuery] string apiKey, [FromQuery] string name)
        {
            if (!_accountService.IsAuthorizedSupplier(apiKey, name))
            {
                return Unauthorized("You are not authorized.");
            }

            return Ok("Supplier is authorized.");
        }
    }
}
