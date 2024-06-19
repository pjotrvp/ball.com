﻿namespace customer_data_service.Models
{
    public class RegisterModel
    {
        public string CompanyName { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
