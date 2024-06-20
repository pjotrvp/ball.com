using customer_data_service.Models;

namespace customer_data_service.Interface
{
    public interface ICustomerService
    {
        Customer GetCustomer(int id);
        IEnumerable<Customer> GetAllCustomers();

        void AddCustomer(Customer customer);
        ShoppingCart GetShoppingCart(int customerId);
        void AddToCart(int customerId, Product product);
    }
}
