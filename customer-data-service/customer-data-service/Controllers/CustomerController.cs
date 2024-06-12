using customer_data_service.Interface;
using customer_data_service.Models;

using Microsoft.AspNetCore.Mvc;

namespace CustomerDataService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerRepository;

        public CustomerController(ICustomerService customerRepository)
        {
            _customerRepository = customerRepository;
        }

        [HttpGet("{id}")]
        public ActionResult<Customer> GetCustomer(int id)
        {
            var customer = _customerRepository.GetCustomer(id);
            if (customer == null)
            {
                return NotFound();
            }
            return Ok(customer);
        }

        [HttpPost]
        public ActionResult RegisterCustomer([FromBody] Customer customer)
        {
            _customerRepository.AddCustomer(customer);
            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
        }

        [HttpPost("{id}/cart")]
        public ActionResult AddToCart(int id, [FromBody] Product product)
        {
            _customerRepository.AddToCart(id, product);
            return NoContent();
        }
    }
}
