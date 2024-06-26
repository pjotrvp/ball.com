namespace customer_service.Models.Events
{
    public class ShoppingCartClearedEvent
    {
        public int CustomerId { get; set; }
        public DateTime ClearedAt { get; set; }

        
    }
}
