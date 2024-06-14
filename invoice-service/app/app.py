from flask import Flask, jsonify, request # type: ignore
import pika # type: ignore
import json

app = Flask(__name__)


# RabbitMQ configuration
RABBITMQ_HOST = 'localhost'
QUEUE_NAME = 'test_queue'

def send_to_queue(message):
    connection = pika.BlockingConnection(pika.ConnectionParameters(RABBITMQ_HOST))
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.basic_publish(
        exchange='',
        routing_key=QUEUE_NAME,
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,  # make message persistent
        ))
    connection.close()

def consume_from_queue():
    connection = pika.BlockingConnection(pika.ConnectionParameters(RABBITMQ_HOST))
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    def callback(ch, method, properties, body):
        print(f"Received {body}")
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback)
    print('Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

@app.route('/send', methods=['POST'])
def send_message():
    message = request.get_json()
    send_to_queue(message)
    return jsonify({"status": "Message sent"}), 201

@app.route('/', methods=['GET'])
def hello_world():
    return jsonify({"message": "Hello, World!"})


@app.route('/invoice', methods=['GET'])
def getInvoices():
    test = [1,2,3,4,5]
    send_to_queue(test)
    return jsonify({"message": "Get invoices called"})


@app.route('/invoice/<int:invoice_id>', methods=['GET'])
def getInvoice():
    return jsonify({"message": "Get invoice/ called"})


@app.route('/invoice', methods=['POST'])
def createInvoice():
    return jsonify({"message": "Post invoice called"})


@app.route('/invoice/<int:invoice_id>', methods=['PUT'])
def updateInvoice():
    return jsonify({"message": "Put invoice/:id called"})


@app.route('/invoice/<int:invoice_id>', methods=['DELETE'])
def delInvoice():
    return jsonify({"message": "Delete invoice called"})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
    
