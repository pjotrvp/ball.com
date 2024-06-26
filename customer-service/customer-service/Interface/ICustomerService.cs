using customer_service.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace customer_service.Interface
{
    public interface ICustomerService
    {
        void AddCustomer(Customer customer);
        Customer GetCustomer(int id);
        Customer GetCustomerByEmail(string email);
        IEnumerable<Customer> GetAllCustomers();
        ShoppingCart GetShoppingCart(int customerId);

        // Methods for event sourcing
        Task AddToCart(int customerId, int productId);
        Task RemoveFromShoppingCart(int customerId, int productId);
        Task ClearShoppingCart(int customerId);
        Task ReadEventsFromStream(int customerId);
    }
}
