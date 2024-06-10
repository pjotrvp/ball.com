namespace AccountService.Models
{
    public class Supplier
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ApiKey { get; set; } // Simple API Key for authorization
    }
}
