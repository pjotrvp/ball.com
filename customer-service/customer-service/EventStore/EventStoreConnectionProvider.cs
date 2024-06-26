using customer_service.Interface;
using EventStore.ClientAPI;
using System;

namespace customer_service.EventStore
{
    public class EventStoreConnectionProvider : IEventStoreConnectionProvider
    {
        private readonly IEventStoreConnection _connection;

        public EventStoreConnectionProvider()
        {
            var settings = ConnectionSettings.Create()
                                             .KeepReconnecting()
                                             .SetReconnectionDelayTo(TimeSpan.FromSeconds(2))
                                             .LimitReconnectionsTo(100)
                                             .Build();

            _connection = EventStoreConnection.Create(settings, new Uri("tcp://localhost:1113"));
            _connection.ConnectAsync().Wait();
        }

        public IEventStoreConnection GetConnection()
        {
            return _connection;
        }
    }
}
