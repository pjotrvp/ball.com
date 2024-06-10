namespace AccountService.Interface
{
    public interface IAccountService
    {
        bool IsAuthorizedSupplier(string apiKey, string name);
    }
}
