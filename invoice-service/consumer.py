from flask import Flask # type: ignore
import pika # type: ignore
import json
from app.config import Config


def consume_from_queue():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=Config.RABBITMQ_HOST, port=Config.RABBITMQ_PORT, credentials=pika.PlainCredentials(Config.RABBITMQ_USER, Config.RABBITMQ_PASSWORD)))
    channel = connection.channel()
    channel.queue_declare(queue=Config.QUEUE_NAME, durable=True)

    def callback(ch, method, properties, body):
        print(f"Received {json.loads(body)}")
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=Config.QUEUE_NAME, on_message_callback=callback)
    print('Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    consume_from_queue()
