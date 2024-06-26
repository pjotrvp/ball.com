namespace customer_service.Models
{
    public class products
    {
        public int id { get; set; }
        public string name { get; set; }
        public string description { get; set; }

        public decimal price { get; set; }
        public int stock { get; set; }
    }
}
