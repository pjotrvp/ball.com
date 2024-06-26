using RabbitMQ.Client;

namespace customer_service.RabbitMQ.Connection
{
    public class RabbitMqConnection:IRabbitMqConnection, IDisposable
    {
        private IConnection? _connection;
        public IConnection Connection => _connection!;

        public RabbitMqConnection(string host)
        {
            InitializeConnection(host);
        }

        private void InitializeConnection(string host)
        {
            var factory = new ConnectionFactory
            {

                HostName = host, // Use the service name defined in docker-compose.yml
                UserName = "guest",
                Password = "guest"



            };
            _connection = factory.CreateConnection();
        }

        public void Dispose() { 
            _connection?.Dispose();
        
        }
    }
}
