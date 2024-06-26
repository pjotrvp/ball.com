namespace customer_service.Models.Events
{
    public class ProductAddedToCartEvent
    {
        public int CustomerId { get; set; }
        public int ProductId { get; set; }
        public DateTime AddedAt { get; set; }
    }
}
