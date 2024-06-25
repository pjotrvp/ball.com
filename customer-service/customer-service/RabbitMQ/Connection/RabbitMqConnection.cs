using RabbitMQ.Client;

namespace customer_service.RabbitMQ.Connection
{
    public class RabbitMqConnection:IRabbitMqConnection, IDisposable
    {
        private IConnection? _connection;
        public IConnection Connection => _connection!;

        public RabbitMqConnection()
        {
            InitializeConnection();
        }

        private void InitializeConnection()
        {
            var factory = new ConnectionFactory
            {
                HostName = "localhost",
                



            };
            _connection = factory.CreateConnection();
        }

        public void Dispose() { 
            _connection?.Dispose();
        
        }
    }
}
