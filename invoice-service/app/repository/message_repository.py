import pika # type: ignore
from app.config import Config

class MessageRepository:
    def __init__(self):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=Config.RABBITMQ_HOST, 
                credentials=pika.PlainCredentials(Config.RABBITMQ_USER, Config.RABBITMQ_PASSWORD)
            )
        )
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue=Config.RABBITMQ_QUEUE)

    def send_message(self, message):
        self.channel.basic_publish(exchange='', routing_key=Config.RABBITMQ_QUEUE, body=message)

    def receive_message(self):
        method_frame, header_frame, body = self.channel.basic_get(queue=Config.RABBITMQ_QUEUE)
        if method_frame:
            self.channel.basic_ack(method_frame.delivery_tag)
            return body.decode()
        else:
            return None
