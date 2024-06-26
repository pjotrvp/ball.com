using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Text;

class Program
{
    static void Main(string[] args)
    {
        var factory = new ConnectionFactory
        {
            HostName = "rabbitmq", // Use the service name defined in docker-compose.yml
            UserName = "guest",
            Password = "guest"
        };

        var connection = factory.CreateConnection();

        using var channel = connection.CreateModel();
        channel.QueueDeclare("customers", durable: true, exclusive: false, autoDelete: false);

        var consumer = new EventingBasicConsumer(channel);
        consumer.Received += (sender, args) =>
        {
            var body = args.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);

            Console.WriteLine($"Message received: {message}");
        };

        channel.BasicConsume(queue: "customers", autoAck: true, consumer: consumer);

        Console.WriteLine("Waiting for messages. Press any key to exit.");
        Console.ReadKey();
    }
}
