namespace customer_service.Models
{
    public class Customer
    {
        public int Id { get; set; } // Primary key

        public string CompanyName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string? Email { get; set; }

    }
}
