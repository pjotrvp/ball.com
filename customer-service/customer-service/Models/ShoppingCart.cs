namespace customer_service.Models
{
    public class ShoppingCart
    {
        public int CustomerId { get; set; }
        public List<Product> Products { get; set; } = new List<Product>();
    }
}
