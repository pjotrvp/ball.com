const amqp = require("amqplib/callback_api");
const mysql = require("mysql2");
const eventHandler = require("./event_handler");

class RabbitMQReadConsumer {
  constructor() {
    this.pool = mysql.createPool({
      host: "mysql-read",
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    this.isCheckingDatabase = false;
  }

  executeReadQuery(channel, message) {
    const sqlQuery = message.content.toString();

    this.pool.query(sqlQuery, (err, result) => {
      if (err) {
        console.error("[R | <=] Error executing query:", err.message);
        // check if the error is due to a lost connection to the database or anything related to the connection
        if (
          err.code === "PROTOCOL_CONNECTION_LOST" ||
          err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR" ||
          err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT" ||
          err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE"
        ) {
          if (!this.isCheckingDatabase) {
            this.checkDatabaseAndResume(channel);
          }
        } else {
          console.error(
            "[R | <=] Query execution failed. Acknowledging message..."
          );
          channel.ack(message);
        }
      } else {
        console.log("[R | <=] Query executed successfully: " + sqlQuery);
        channel.ack(message);
      }
    });
  }

  checkDatabaseAndResume(channel) {
    this.isCheckingDatabase = true;
    console.log("[R | <=] Checking database connection...");

    this.pool.query("SELECT 1", (error) => {
      if (error) {
        console.error(
          "[R | <=] Database connection check failed. Retrying in 5 seconds..."
        );
        setTimeout(() => this.checkDatabaseAndResume(channel), 5000);
      } else {
        console.log(
          "[R | <=] Database connection check succeeded. Resuming message consumption..."
        );
        this.isCheckingDatabase = false;
        channel.recover();
      }
    });
  }

  startConsuming(channel) {
    const readQueue = "order_replication_queue";

    channel.consume(
      readQueue,
      (message) => {
        this.executeReadQuery(channel, message);
      },
      {
        noAck: false,
        consumerTag: "readConsumer",
      }
    );
  }

  startConsumingCommands(channel) {
    channel.consume(
      this.queue,
      async (message) => {
        if (!message) return;
        const command = JSON.parse(message.content.toString());

        try {
          console.log("[W | <=] Received command: ", command.type);
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

  listenToReadQueue() {
    amqp.connect("amqp://rabbitmq-queue", (errorConnect, connection) => {
      if (errorConnect) {
        console.error(
          "[R | <=] Error connecting to RabbitMQ: ",
          errorConnect.message
        );
        setTimeout(() => this.listenToReadQueue(), 5000);
        return;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          console.error(
            "[R | <=] Error creating channel: ",
            errorChannel.message
          );
          setTimeout(() => this.listenToReadQueue(), 5000);
          return;
        }

        const orderQueue = "order_queue";
        const inventoryQueue = "inventory_queue";
        const readQueue = "order_replication_queue";

        channel.assertQueue(readQueue, {
          durable: true,
        });
        channel.assertQueue(orderQueue, {
          durable: true,
        });
        channel.assertQueue(inventoryQueue, {
          durable: true,
        });

        console.log("[R | <=] Waiting for messages in %s", orderQueue);
        console.log("[R | <=] Waiting for messages in %s", inventoryQueue);
        console.log("[R | <=] Waiting for messages in %s", readQueue);

        this.startConsuming(channel);
        this.startConsumingCommands(channel);
      });
    });
  }
}

module.exports = RabbitMQReadConsumer;
