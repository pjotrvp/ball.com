const amqp = require("amqplib/callback_api");

class RabbitMQPublisher {
  constructor() {
    this.channel = null;
    this.init();
  }

  init() {
    amqp.connect("amqp://rabbitmq-queue", (errorConnect, connection) => {
      if (errorConnect) {
        throw errorConnect;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          throw errorChannel;
        }

        const queue = "inventory_queue";
        channel.assertQueue(queue, {
          durable: true,
        });

        this.channel = channel;
      });
    });
  }

  publish(command) {
    if (!this.channel) {
      console.log("[=>] Channel not yet initialized. Try again.");
      return;
    }

    const queue = "inventory_queue";
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(command)), {
      persistent: true,
    });

    console.log("[=>] Sent %s to queue", JSON.stringify(command));
  }
}

module.exports = new RabbitMQPublisher();
