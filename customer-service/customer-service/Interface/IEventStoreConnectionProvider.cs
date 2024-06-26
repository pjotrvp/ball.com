using EventStore.ClientAPI;

namespace customer_service.Interface
{
    public interface IEventStoreConnectionProvider
    {
        IEventStoreConnection GetConnection();
    }
}
