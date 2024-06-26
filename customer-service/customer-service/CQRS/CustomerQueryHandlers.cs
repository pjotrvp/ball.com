using customer_service.Context;
using customer_service.CQRS.Models;
using customer_service.Interface;
using customer_service.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace customer_service.Handlers
{
    public class CustomerQueryHandlers : ICustomerQueryHandlers
    {
        private readonly AuthDbContext _context;

        public CustomerQueryHandlers(AuthDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Customer> Handle(GetAllCustomersQuery query)
        {
            return _context.Customers.ToList();
        }

        public Customer Handle(GetCustomerByIdQuery query)
        {
            return _context.Customers.Find(query.CustomerId);
        }

        public ShoppingCart Handle(GetShoppingCartQuery query)
        {
            return _context.ShoppingCart.FirstOrDefault(sc => sc.CustomerId == query.CustomerId);
        }
    }
}
