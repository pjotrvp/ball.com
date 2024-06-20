using customer_data_service.Interface;
using customer_data_service.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CsvHelper;
using CsvHelper.Configuration;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace CustomerDataService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly IConfiguration _configuration;

        public CustomerController(ICustomerService customerService, IConfiguration configuration)
        {
            _customerService = customerService;
            _configuration = configuration;
        }

        [HttpGet("{id}")]
        public ActionResult<Customer> GetCustomer(int id)
        {
            var customer = _customerService.GetCustomer(id);
            if (customer == null)
            {
                return NotFound();
            }
            return Ok(customer);
        }

        [HttpGet("all")]
        public ActionResult<IEnumerable<Customer>> GetAllCustomers()
        {
            var customers = _customerService.GetAllCustomers().ToList();
            return Ok(customers);
        }

        [HttpPost("{id}/cart")]
        public ActionResult AddToCart(int id, [FromBody] Product product)
        {
            _customerService.AddToCart(id, product);
            return NoContent();
        }














        [HttpPost("import")]
        public ActionResult ImportCustomers(IFormFile file, [FromQuery] string password)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            // Retrieve the password from configuration
            string importPassword = _configuration["AppSettings:ImportPassword"];

            // Check if provided password matches configured password
            if (password != importPassword)
            {
                return Unauthorized("Invalid password.");
            }

            List<Customer> customers;
            using (var reader = new StreamReader(file.OpenReadStream()))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                csv.Context.RegisterClassMap<CustomerMap>();
                customers = csv.GetRecords<Customer>().ToList();
            }

            foreach (var customer in customers)
            {
                _customerService.AddCustomer(customer); // Using the ICustomerService to add each customer
            }

            return Ok("CSV file imported successfully.");
        }
    }

    public class CustomerMap : ClassMap<Customer>
    {
        public CustomerMap()
        {
            Map(m => m.CompanyName).Name("Company Name");
            Map(m => m.FirstName).Name("First Name");
            Map(m => m.LastName).Name("Last Name");
            Map(m => m.PhoneNumber).Name("Phone Number");
            Map(m => m.Address).Name("Address");
        }
    }
}
