using customer_service.Context;
using customer_service.Interface;
using customer_service.Models;
using customer_service.RabbitMQ;

namespace customer_service.Services
{
    public class CustomerService:ICustomerService
    {

        private readonly AuthDbContext _context;
        private readonly IMessageProducer _messageProducer;
        public CustomerService(AuthDbContext context, IMessageProducer messageProducer)
        {
            _context = context;
            _messageProducer = messageProducer;
        }

      
        public void AddCustomer(Customer customer)
        {
            if (customer is not null)
            {
                _context.Customers.Add(customer);
                _context.SaveChanges();
                _messageProducer.SendMessage(customer);

            }
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

