using customer_service.Context;
using customer_service.Interface;
using customer_service.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace customer_service.Services
{
    public class ShoppingCartService : IShoppingCartService
    {
        private readonly AuthDbContext _context;

        public ShoppingCartService(AuthDbContext context)
        {
            _context = context;
        }

        public void CreateShoppingCart(int customerId)
        {
            var cart = new ShoppingCart { CustomerId = customerId };
            _context.ShoppingCart.Add(cart);
            _context.SaveChanges();
        }
        public ShoppingCart GetShoppingCart(int customerId)
        {
            var shoppingCart = _context.ShoppingCart
                .SingleOrDefault(sc => sc.CustomerId == customerId);

            // Handle case where shoppingCart might be null
            if (shoppingCart == null)
            {
                // Optionally, create a new shopping cart or handle the null case as per your application logic
                // Example: Create a new shopping cart
                shoppingCart = new ShoppingCart
                {
                    CustomerId = customerId,
                    // Initialize other properties if needed
                };
            }

            return shoppingCart;
        }
    }
}
