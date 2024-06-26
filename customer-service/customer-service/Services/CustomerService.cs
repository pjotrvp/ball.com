using customer_service.Context;
using customer_service.Interface;
using customer_service.Models;
using customer_service.RabbitMQ;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace customer_service.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly AuthDbContext _context;
        private readonly IMessageProducer _messageProducer;
        private readonly IShoppingCartService _shoppingCartService;

        public CustomerService(AuthDbContext context, IMessageProducer messageProducer, IShoppingCartService shoppingCartService)
        {
            _context = context;
            _messageProducer = messageProducer;
            _shoppingCartService = shoppingCartService;
        }

        public void AddCustomer(Customer customer)
        {
            if (customer != null)
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

        public Customer GetCustomerByEmail(string email)
        {
            return _context.Customers.SingleOrDefault(c => c.Email == email);
        }

        public IEnumerable<Customer> GetAllCustomers()
        {
            return _context.Customers.ToList();
        }

        public ShoppingCart GetShoppingCart(int customerId)
        {
            return _shoppingCartService.GetShoppingCart(customerId);
        }

        public void AddToCart(int customerId, int productId)
        {
            var shoppingCart = _shoppingCartService.GetShoppingCart(customerId);

            if (shoppingCart == null)
            {
                // Create new shopping cart if it doesn't exist
                shoppingCart = new ShoppingCart
                {
                    CustomerId = customerId,
                    ProductsIds = JsonConvert.SerializeObject(new List<int> { productId })
                };
                _context.ShoppingCart.Add(shoppingCart);
            }
            else
            {
                // Deserialize existing product IDs, ensure to handle null or empty JSON
                var productIds = new List<int>();
                if (!string.IsNullOrEmpty(shoppingCart.ProductsIds))
                {
                    productIds = JsonConvert.DeserializeObject<List<int>>(shoppingCart.ProductsIds);
                }

                // Add the new product ID
                productIds.Add(productId);

                // Serialize back to JSON
                shoppingCart.ProductsIds = JsonConvert.SerializeObject(productIds);
                _context.ShoppingCart.Update(shoppingCart);
            }

            _context.SaveChanges();
            _messageProducer.SendMessage(shoppingCart);


        }
        public void RemoveFromShoppingCart(int customerId, int productId)
        {
            var shoppingCart = _shoppingCartService.GetShoppingCart(customerId);

            if (shoppingCart != null && !string.IsNullOrEmpty(shoppingCart.ProductsIds))
            {
                // Deserialize existing product IDs
                var productIds = JsonConvert.DeserializeObject<List<int>>(shoppingCart.ProductsIds);

                // Remove the product ID if it exists
                productIds.Remove(productId);

                // Serialize back to JSON
                shoppingCart.ProductsIds = JsonConvert.SerializeObject(productIds);
                _context.ShoppingCart.Update(shoppingCart);

                _context.SaveChanges();
                _messageProducer.SendMessage(shoppingCart);

            }
        }

        public void ClearShoppingCart(int customerId)
        {
            var shoppingCart = _shoppingCartService.GetShoppingCart(customerId);

            if (shoppingCart != null)
            {
                // Clear the JSON array
                shoppingCart.ProductsIds = JsonConvert.SerializeObject(new List<int>());
                _context.ShoppingCart.Update(shoppingCart);

                _context.SaveChanges();
                _messageProducer.SendMessage(shoppingCart);

            }
        }
    }
}

      
    

