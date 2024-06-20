using customer_data_service.Context;
using customer_data_service.Interface;
using customer_data_service.Models;

namespace customer_data_service.Services
{
    public class CustomerService:ICustomerService
    {

        private readonly AuthDbContext _context;

        public CustomerService(AuthDbContext context)
        {
            _context = context;
        }

        public void AddCustomer(Customer customer)
        {
            _context.Customers.Add(customer);
            _context.SaveChanges();
        }

        public Customer GetCustomer(int id)
        {
            return _context.Customers.Find(id);
        }

        public IEnumerable<Customer> GetAllCustomers()
        {
            return _context.Customers.ToList();
        }

        public ShoppingCart GetShoppingCart(int customerId)
        {
            return null;
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

