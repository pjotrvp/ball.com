const amqp = require("amqplib/callback_api");
const mysql = require("mysql2");

class RabbitMQConsumer {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    this.isCheckingDatabase = false;
  }

  executeQuery(channel, message) {
    const sqlQuery = message.content.toString();

    this.pool.query(sqlQuery, (err, result) => {
      if (err) {
        console.error("[W | <=] Error executing query:", err.message);
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
            "[W | <=] Query execution failed. Acknowledging message..."
          );
          channel.ack(message);
        }
      } else {
        console.log("[W | <=] Query executed successfully: " + sqlQuery);
        this.sendToReplicationQueue(channel, sqlQuery);
        channel.ack(message);
      }
    });
  }

  checkDatabaseAndResume(channel) {
    this.isCheckingDatabase = true;
    this.pool.getConnection((err, connection) => {
      if (err) {
        console.error(
          "[W | <=] Error connecting to database. Retrying in 5 seconds..."
        );
        setTimeout(() => {
          this.checkDatabaseAndResume(channel);
        }, 5000);
      } else {
        console.log("[W | <=] Database connection established.");
        connection.release();
        this.isCheckingDatabase = false;
        channel.recover();
      }
    });
  }

  startConsuming(channel) {
    const queue = "customer_queue";

    channel.consume(
      queue,
      (message) => {
        this.executeQuery(channel, message);
      },
      {
        noAck: false,
        consumerTag: "myConsumer",
      }
    );
  }

  sendToReplicationQueue(channel, sqlQuery) {
    const queue = "customer_replication_queue";
    channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(sqlQuery), { persistent: true });
    console.log("[R | =>] Sent to replication queue: " + sqlQuery);
  }

  listenToQueue() {
    amqp.connect("amqp://rabbitmq-queue", (errorConnect, connection) => {
      if (errorConnect) {
        console.error(
          "[W | <=] Error connecting to RabbitMQ: ",
          errorConnect.message
        );
        setTimeout(() => this.listenToQueue(), 5000);
        return;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          console.error(
            "[W | <=] Error creating channel: ",
            errorChannel.message
          );
          setTimeout(() => this.listenToQueue(), 5000);
          return;
        }

        const queue = "customer_queue";

        channel.assertQueue(queue, {
          durable: true,
        });

        console.log("[W | <=] Waiting for messages in %s", queue);

        this.startConsuming(channel);
      });
    });
  }
}

module.exports = RabbitMQConsumer;
