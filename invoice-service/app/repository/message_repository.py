import logging
import pika # type: ignore
from app.config import Config
import time
from threading import Thread
import json
import requests


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
            self.channel.queue_declare(queue=Config.RABBITMQ_QUEUE, durable=True)
            self.order_channel = self.connection.channel()
            self.order_channel.queue_declare(queue=Config.RABBITMQ_QUEUE_ORDER, durable=True)
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
            message_dict = json.loads(body)
            message_type = message_dict.get("type")
            if "OrderCreated" in message_type:
                logging.info("Order Created message received")
                customerId = message_dict["payload"]["customerId"]
                orderId = message_dict["payload"]["orderId"]
                status = "Not paid"


                # Example payload for POST request
                payload = {
                    "customerId": customerId,
                    "orderId": orderId,
                    "status": status
                }

                # URL of the Flask endpoint to send the POST request
                url = "http://localhost:5000/invoice/"

                # Send POST request
                try:
                    response = requests.post(url, json=payload)

                    # Check if request was successful
                    if response.status_code == 200:
                        logging.info("POST request successful")
                    else:
                        logging.error(f"POST request failed with status code {response.status_code}")

                except requests.exceptions.RequestException as e:
                    logging.error(f"Error sending POST request: {e}")

                

        self.order_channel.basic_consume(queue=Config.RABBITMQ_QUEUE_ORDER, on_message_callback=callback, auto_ack=True)
        logging.info('Consuming messages from RabbitMQ...')
        self.order_channel.start_consuming()
