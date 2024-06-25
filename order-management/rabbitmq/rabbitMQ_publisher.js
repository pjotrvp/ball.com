const amqp = require("amqplib/callback_api");

class RabbitMQManager {
  constructor() {
    this.channel = null;
    this.setupConnection();
  }

  setupConnection() {
    amqp.connect("amqp://rabbitmq-queue", (errorConnect, connection) => {
      if (errorConnect) {
        throw errorConnect;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          throw errorChannel;
        }

        const dbQueue = "db_order_queue";
        const regularQueue = "order_queue";
        channel.assertQueue(dbQueue, {
          durable: true,
        });

        channel.assertQueue(regularQueue, {
          durable: true,
        });

        this.channel = channel;
      });
    });
  }

  addMessage(message) {
    if (!this.channel) {
      console.log("[=>] Channel not yet initialized. Try again.");
      return;
    }

    const queue = "db_order_queue";
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log("[=>] Sent %s to queue", message);
  }

  addInventoryMessage(message) {
    if (!this.channel) {
      console.log("[=>] Channel not yet initialized. Try again.");
      return;
    }

    const queue = "inventory_queue";
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log("[=>] Sent %s to queue", message);
  }

  addRegularMessage(message) {
    if (!this.channel) {
      console.log("[=>] Channel not yet initialized. Try again.");
      return;
    }

    const queue = "order_queue";
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log("[=>] Sent %s to queue", message);
  }
}

module.exports = new RabbitMQManager();
