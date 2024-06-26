using customer_service.CQRS.Models;
using customer_service.Models;
using System.Collections.Generic;

namespace customer_service.Interface
{
    public interface ICustomerQueryHandlers
    {
        IEnumerable<Customer> Handle(GetAllCustomersQuery query);
        Customer Handle(GetCustomerByIdQuery query);
        ShoppingCart Handle(GetShoppingCartQuery query);
    }
}
