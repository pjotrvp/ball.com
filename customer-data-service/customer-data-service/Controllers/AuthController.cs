using customer_data_service.Models;
using customer_data_service.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace customer_data_service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        [HttpPost("Register")]
        public async Task<IActionResult> RegisterUser(LoginModel user)
        {
            if(await _authService.RegisterUser(user))
            {
                return Ok("Successfuly done");
            }
            return BadRequest("Something went wrong");
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginModel user)
        {
            if (!ModelState.IsValid) {
                return BadRequest();
            }

            var result = await _authService.Login(user);
            if(result == true)
            {
                var tokenString = _authService.GenerateTokenString(user);
                return Ok(tokenString);
            }
            return BadRequest();
        }
    }
}
