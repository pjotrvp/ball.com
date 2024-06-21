const amqp = require("amqplib/callback_api");
const { readPool } = require("../../pool");

class RabbitMQConsumer {
  constructor() {
    this.isCheckingDatabase = false;
  }

  consume(channel, queue) {
    channel.consume(queue, (message) => {
        if (!message) return;
        const command = JSON.parse(message.content.toString());
        
        try {
          switch (command.type) {
            case "CreateProduct":
              console.log("[W | <=] Received command: ", command);
              break;
            case "UpdateProduct":
              console.log("[W | <=] Received command: ", command);
              break;
            case "DeleteProduct":
              console.log("[W | <=] Received command: ", command);
              break;
          }

          channel.ack(message);
        } catch (error) {
          console.error("[W | <=] Error processing command: ", error.message);
          channel.nack(message);
        }
      },
      {
        noAck: false,
        consumerTag: "myConsumer",
      }
    );
  }

  listen() {
    amqp.connect("amqp://rabbitmq-queue", (errorConnect, connection) => {
      if (errorConnect) {
        console.error(
          "[W | <=] Error connecting to RabbitMQ: ",
          errorConnect.message
        );
        setTimeout(() => this.listen(), 5000);
        return;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          console.error(
            "[W | <=] Error creating channel: ",
            errorChannel.message
          );
          setTimeout(() => this.listen(), 5000);
          return;
        }

        const queue = "inventory_queue";
        channel.assertQueue(queue, {
          durable: true,
        });

        console.log("[W | <=] Waiting for messages in %s", queue);

        this.consume(channel, queue);
      });
    });
  }
}

module.exports = RabbitMQConsumer;
