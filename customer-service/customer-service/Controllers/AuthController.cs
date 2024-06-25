using customer_service.Interface;
using customer_service.Models;
using customer_service.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace customer_service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ICustomerService _customerService;

        public AuthController(IAuthService authService, ICustomerService customerService)
        {
            _authService = authService;
            _customerService = customerService;
        }
        [HttpPost("Register")]
        public async Task<IActionResult> RegisterUser(RegisterModel user)
        {
            Customer customer = new Customer();
            if(await _authService.RegisterUser(user))
            {
                customer.Email = user.Email;
                customer.FirstName = user.FirstName;
                customer.LastName = user.LastName;
                customer.PhoneNumber = user.PhoneNumber;
                customer.Address = user.Address;
                customer.CompanyName = user.CompanyName;

                _customerService.AddCustomer(customer);

                var response = new 
                {
                    Message = "Registration successful",
                    RegisteredCustomer = customer
                };
                return Ok(response);
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
                var response = new {
                    Message = "Login succesful",
                    Token = tokenString
                };

                return Ok(response);
            }
            return BadRequest();
        }
    }
}
