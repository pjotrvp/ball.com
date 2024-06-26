using customer_service.Context;
using customer_service.EventStore;
using customer_service.Interface;
using customer_service.Models;
using customer_service.Models.Events;
using customer_service.RabbitMQ;
using EventStore.ClientAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using customer_service.Handlers;
using customer_service.CQRS.Models;

namespace customer_service.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly AuthDbContext _context;
        private readonly IMessageProducer _messageProducer;
        private readonly IShoppingCartService _shoppingCartService;
        private readonly IEventStoreConnection _eventStoreConnection; // EventStoreDB connection
        private readonly ILogger<CustomerService> _logger;
        private readonly ICustomerQueryHandlers _queryHandlers;

        public CustomerService(AuthDbContext context, IMessageProducer messageProducer, IShoppingCartService shoppingCartService, IEventStoreConnectionProvider eventStoreConnectionProvider, ILogger<CustomerService> logger, ICustomerQueryHandlers queryHandlers)
        {
            _context = context;
            _messageProducer = messageProducer;
            _shoppingCartService = shoppingCartService;
            _eventStoreConnection = eventStoreConnectionProvider.GetConnection();
            _logger = logger;
            _queryHandlers = queryHandlers;

        }

        public CustomerService()
        {
        }

        public void AddCustomer(Customer customer)
        {
            _logger.LogInformation("Entering AddCustomer method");
            if (customer != null)
            {
                _logger.LogInformation($"Adding customer: {JsonConvert.SerializeObject(customer)}");
                _context.Customers.Add(customer);
                _context.SaveChanges();
                _messageProducer.SendMessage(customer);
                _logger.LogInformation("Customer added and message sent");
            }
            _logger.LogInformation("Exiting AddCustomer method");
        }

        public Customer GetCustomer(int id)
        {
            var query = new GetCustomerByIdQuery { CustomerId = id };
            return _queryHandlers.Handle(query);
        }

        public Customer GetCustomerByEmail(string email)
        {
            _logger.LogInformation($"Getting customer with email: {email}");
            var customer = _context.Customers.SingleOrDefault(c => c.Email == email);
            _logger.LogInformation($"Customer retrieved: {JsonConvert.SerializeObject(customer)}");
            return customer;
        }

        public IEnumerable<Customer> GetAllCustomers()
        {
            var query = new GetAllCustomersQuery();
            return _queryHandlers.Handle(query);
        }


        public ShoppingCart GetShoppingCart(int customerId)
        {
            var query = new GetShoppingCartQuery { CustomerId = customerId };
            return _queryHandlers.Handle(query);
        }

        public async Task AddToCart(int customerId, int productId)
        {
            _logger.LogInformation($"Adding product id: {productId} to cart for customer id: {customerId}");
            var shoppingCart = _shoppingCartService.GetShoppingCart(customerId);

            if (shoppingCart == null)
            {
                _logger.LogInformation("Shopping cart not found, creating new one");
                shoppingCart = new ShoppingCart
                {
                    CustomerId = customerId,
                    ProductsIds = JsonConvert.SerializeObject(new List<int> { productId })
                };
                _context.ShoppingCart.Add(shoppingCart);
            }
            else
            {
                var productIds = new List<int>();
                if (!string.IsNullOrEmpty(shoppingCart.ProductsIds))
                {
                    productIds = JsonConvert.DeserializeObject<List<int>>(shoppingCart.ProductsIds);
                }
                productIds.Add(productId);
                shoppingCart.ProductsIds = JsonConvert.SerializeObject(productIds);
                _context.ShoppingCart.Update(shoppingCart);
            }

            var @event = new ProductAddedToCartEvent
            {
                CustomerId = customerId,
                ProductId = productId,
                AddedAt = DateTime.UtcNow
            };
            await AppendEventToStream($"shoppingCart-{customerId}", @event);

            _context.SaveChanges();
            _messageProducer.SendMessage(shoppingCart);
            _logger.LogInformation($"Product added to cart and event sent: {JsonConvert.SerializeObject(@event)}");
        }

        public async Task RemoveFromShoppingCart(int customerId, int productId)
        {
            _logger.LogInformation($"Removing product id: {productId} from cart for customer id: {customerId}");
            var shoppingCart = _shoppingCartService.GetShoppingCart(customerId);

            if (shoppingCart != null && !string.IsNullOrEmpty(shoppingCart.ProductsIds))
            {
                var productIds = JsonConvert.DeserializeObject<List<int>>(shoppingCart.ProductsIds);
                productIds.Remove(productId);
                shoppingCart.ProductsIds = JsonConvert.SerializeObject(productIds);
                _context.ShoppingCart.Update(shoppingCart);

                var @event = new ProductRemovedFromCartEvent
                {
                    CustomerId = customerId,
                    ProductId = productId,
                    RemovedAt = DateTime.UtcNow
                };
                await AppendEventToStream($"shoppingCart-{customerId}", @event);

                _context.SaveChanges();
                _messageProducer.SendMessage(shoppingCart);
                _logger.LogInformation($"Product removed from cart and event sent: {JsonConvert.SerializeObject(@event)}");
            }
        }

        public async Task ClearShoppingCart(int customerId)
        {
            _logger.LogInformation($"Clearing shopping cart for customer id: {customerId}");
            var shoppingCart = _shoppingCartService.GetShoppingCart(customerId);

            if (shoppingCart != null)
            {
                shoppingCart.ProductsIds = JsonConvert.SerializeObject(new List<int>());
                _context.ShoppingCart.Update(shoppingCart);

                var @event = new ShoppingCartClearedEvent
                {
                    CustomerId = customerId,
                    ClearedAt = DateTime.UtcNow
                };
                await AppendEventToStream($"shoppingCart-{customerId}", @event);

                _context.SaveChanges();
                _messageProducer.SendMessage(shoppingCart);
                _logger.LogInformation($"Shopping cart cleared and event sent: {JsonConvert.SerializeObject(@event)}");
            }
        }

        private async Task AppendEventToStream(string streamName, object @event)
        {
            _logger.LogInformation($"Appending event to stream: {streamName}");
            var eventData = EventStoreEventData.CreateEventData(@event);
            await _eventStoreConnection.AppendToStreamAsync(streamName, ExpectedVersion.Any, eventData);
            _logger.LogInformation($"Event appended: {JsonConvert.SerializeObject(@event)}");
        }

        public Task ReadEventsFromStream(int customerId)
        {
            throw new NotImplementedException();
        }
    }
}
