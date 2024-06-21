const amqp = require("amqplib/callback_api");
const rabbitmqConfig = require("../../configs/rabbitmq.config");

class RabbitMQPublisher {
  constructor(url, queue) {
    this.channel = null;
    this.url = url || rabbitmqConfig.url;
    this.queue = queue || rabbitmqConfig.queue;

    this.connect();
  }

  connect() {
    amqp.connect(this.url, (errorConnect, connection) => {
      if (errorConnect) {
        throw errorConnect;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          throw errorChannel;
        }

        channel.assertQueue(this.queue, {
          durable: true,
        });

        this.channel = channel;
      });
    });
  }

  publish(message) {
    if (!this.channel) {
      console.log("[=>] Channel not yet initialized. Try again.");
      return;
    }

    this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log("[=>] Sent %s to queue", message);
  }
}

module.exports = RabbitMQPublisher;
