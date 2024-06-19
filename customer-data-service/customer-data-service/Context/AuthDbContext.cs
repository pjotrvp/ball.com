using customer_data_service.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace customer_data_service.Context
{
    public class AuthDbContext:IdentityDbContext
    {
        public AuthDbContext(DbContextOptions options):base (options) 
        { 

        }

        //public DbSet<Customer> Customers { get; set; }
    }
}
