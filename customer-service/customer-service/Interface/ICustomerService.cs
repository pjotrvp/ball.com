using customer_service.Models;
using System.Collections.Generic;

namespace customer_service.Interface
{
    public interface ICustomerService
    {
        void AddCustomer(Customer customer);
        Customer GetCustomer(int id);
        Customer GetCustomerByEmail(string email);

        IEnumerable<Customer> GetAllCustomers();
        ShoppingCart GetShoppingCart(int customerId);
        void AddToCart(int customerId, int productId);
        void ClearShoppingCart(int customerId);
        void RemoveFromShoppingCart(int customerId, int productId);
    }
}
