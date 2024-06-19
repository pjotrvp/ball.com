using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace customer_data_service.Models
{
  
    public class LoginModel
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }
}
