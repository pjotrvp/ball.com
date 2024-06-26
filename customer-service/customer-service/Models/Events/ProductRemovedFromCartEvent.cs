namespace customer_service.Models.Events
{
    public class ProductRemovedFromCartEvent
    {
        public int CustomerId { get; set; }
        public int ProductId { get; set; }
        public DateTime RemovedAt { get; set; }
    }
}
