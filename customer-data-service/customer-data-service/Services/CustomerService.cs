using customer_data_service.Interface;
using customer_data_service.Models;

namespace customer_data_service.Services
{
    public class CustomerService:ICustomerService
    {
        private readonly List<Customer> customers = new();
        private readonly List<ShoppingCart> shoppingCarts = new();

        public Customer GetCustomer(int id)
        {
            return customers.FirstOrDefault(c => c.Id == id);
        }

        public void AddCustomer(Customer customer)
        {
            customers.Add(customer);
            shoppingCarts.Add(new ShoppingCart { CustomerId = customer.Id });
        }

        public ShoppingCart GetShoppingCart(int customerId)
        {
            return shoppingCarts.FirstOrDefault(sc => sc.CustomerId == customerId);
        }

        public void AddToCart(int customerId, Product product)
        {
            var cart = GetShoppingCart(customerId);
            if (cart != null)
            {
                cart.Products.Add(product);
            }
        }
    }
}

