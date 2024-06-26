import logging
import pika # type: ignore
from app.config import Config
import time
from threading import Thread



class MessageRepository:
    def __init__(self):
        time.sleep(5)
        try:
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=Config.RABBITMQ_HOST,
                    port=Config.RABBITMQ_PORT,
                    credentials=pika.PlainCredentials(Config.RABBITMQ_USER, Config.RABBITMQ_PASSWORD)
                )
            )
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue=Config.RABBITMQ_QUEUE)
            logging.info("Succesfully established a connection to RabbitMQ")

            self.consumer_thread = Thread(target=self.consume_messages)
            self.consumer_thread.daemon = True
            self.consumer_thread.start()
            logging.info("Started consuming")
        except pika.exceptions.AMQPConnectionError as e:
            logging.error(f"Failed to connect to RabbitMQ: {e}", exc_info=True)

    def send_message(self, message):
        self.channel.basic_publish(exchange='', routing_key=Config.RABBITMQ_QUEUE, body=message)

    def receive_message(self):
        method_frame, header_frame, body = self.channel.basic_get(queue=Config.RABBITMQ_QUEUE)
        if method_frame:
            self.channel.basic_ack(method_frame.delivery_tag)
            return body.decode()
        else:
            return None
        

    def consume_messages(self):
        def callback(ch, method, properties, body):
            logging.info(f"Received message: {body.decode()}")

            # Process or handle the received message as needed
            # Example: call a service method to handle the message
            # message_service.process_message(body.decode())

        self.channel.basic_consume(queue=Config.RABBITMQ_QUEUE, on_message_callback=callback, auto_ack=True)
        logging.info('Consuming messages from RabbitMQ...')
        self.channel.start_consuming()
