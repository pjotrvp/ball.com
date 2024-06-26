using Microsoft.AspNetCore.Mvc;
using customer_service.Interface;
using customer_service.Models;
using System;
using customer_service.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace customer_service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ShoppingCartController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly IShoppingCartService _shoppingCartService;
        public ShoppingCartController(ICustomerService customerService, IShoppingCartService shoppingCartService)
        {
            _customerService = customerService;
            _shoppingCartService = shoppingCartService;
        }
        private int GetCustomerId()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null)
            {
                throw new Exception("Email not found in token.");
            }

            var customer = _customerService.GetCustomerByEmail(email);
            if (customer == null)
            {
                throw new Exception("Customer not found.");
            }

            return customer.Id;
        }
        [HttpGet()]
        public IActionResult GetShoppingCart()
        {
            try
            {
                var customerId = GetCustomerId();

                var cart = _shoppingCartService.GetShoppingCart(customerId);
                if (cart == null)
                {
                    return NotFound();
                }
                return Ok(cart);
            }catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("customers/{customerId}/shoppingcart/add")]
        public IActionResult AddToShoppingCart(int customerId, [FromBody] AddProductRequest request)
        {
            try
            {
                _customerService.AddToCart(customerId, request.ProductId);
                return Ok("Product added to shopping cart successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("customers/{customerId}/shoppingcart/remove")]
        public IActionResult RemoveFromShoppingCart(int customerId, [FromBody] AddProductRequest request)
        {
            try
            {
                _customerService.RemoveFromShoppingCart(customerId, request.ProductId);
                return Ok("Product removed from shopping cart successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("customers/{customerId}/shoppingcart/clear")]
        public IActionResult ClearShoppingCart(int customerId)
        {
            try
            {
                _customerService.ClearShoppingCart(customerId);
                return Ok("Shopping cart cleared successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
