using customer_service.Models;

namespace customer_service.Services
{
    public interface IAuthService
    {
        string GenerateTokenString(LoginModel user);
        Task<bool> Login(LoginModel user);
        Task<bool> RegisterUser(RegisterModel user);
    }
}