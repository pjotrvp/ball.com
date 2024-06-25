const amqp = require("amqplib/callback_api");
const rabbitmqConfig = require("../../configs/rabbitmq.config");
const eventHandler = require("../../handlers/event.handler");

class RabbitMQConsumer {
  constructor(url, queue) {
    this.channel = null;
    this.url = url || rabbitmqConfig.url;
    this.queue = queue || rabbitmqConfig.queue;
  }

  connectAndListen() {
    amqp.connect(this.url, (errorConnect, connection) => {
      if (errorConnect) {
        console.error(
          "[W | <=] Error connecting to RabbitMQ: ",
          errorConnect.message
        );
        setTimeout(() => this.connectAndListen(), 5000);
        return;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          console.error(
            "[W | <=] Error creating channel: ",
            errorChannel.message
          );
          setTimeout(() => this.connectAndListen(), 5000);
          return;
        }

        this.setupChannel(channel);
      });
    });
  }

  setupChannel(channel) {
    channel.assertQueue(this.queue, {
      durable: true,
    });

    console.log("[W | <=] Waiting for messages in %s", this.queue);

    this.consume(channel);
  }

  consume(channel) {
    channel.consume(this.queue, async (message) => {
        if (!message) return;
        const command = JSON.parse(message.content.toString());

        try {
          await eventHandler.handleEvent(command);
          channel.ack(message);
        } catch (error) {
          console.error("[W | <=] Error processing command: ", error.message);
          channel.ack(message);
        }
      },
      {
        noAck: false,
        consumerTag: "myConsumer",
      }
    );

    this.channel = channel;
  }
}

module.exports = RabbitMQConsumer;
