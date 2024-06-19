using customer_data_service.Models;

namespace customer_data_service.Services
{
    public interface IAuthService
    {
        string GenerateTokenString(LoginModel user);
        Task<bool> Login(LoginModel user);
        Task<bool> RegisterUser(RegisterModel user);
    }
}