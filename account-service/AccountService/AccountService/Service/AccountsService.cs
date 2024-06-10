using AccountService.Interface;
using AccountService.Models;

namespace AccountService.Service
{
    public class AccountsService : IAccountService
    {
        private readonly List<Supplier> suppliers = new List<Supplier>
    {
        new Supplier { Id = 1, Name = "Supplier1", ApiKey = "apikey1" },
        new Supplier { Id = 2, Name = "Supplier2", ApiKey = "apikey2" }
    };

        public bool IsAuthorizedSupplier(string apiKey, string name)
        {
            return suppliers.Any(s => s.ApiKey == apiKey && s.Name == name);
        }
    }
}
