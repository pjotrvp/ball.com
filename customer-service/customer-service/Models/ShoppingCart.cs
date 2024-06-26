namespace customer_service.Models
{
    public class ShoppingCart
    {
        public int ShoppingCartId { get; set; }
        public int CustomerId { get; set; }
        public string ProductsIds { get; set; } // JSON string to store products

        // Navigation property for customer (if needed)
        //public Customer Customer { get; set; }
    }
}
