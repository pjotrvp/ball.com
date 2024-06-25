using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace customer_service.Models
{
  
    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
