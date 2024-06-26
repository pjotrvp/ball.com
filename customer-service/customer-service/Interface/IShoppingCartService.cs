using customer_service.Models;

namespace customer_service.Interface
{
    public interface IShoppingCartService
    {
        void CreateShoppingCart(int customerId);
        ShoppingCart GetShoppingCart(int customerId);
    }
}
