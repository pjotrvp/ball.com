using Microsoft.AspNetCore.Identity;

namespace customer_service.Models
{
    public class ApplicationUser:IdentityUser
    {
        public string CompanyName { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }



    }
}
