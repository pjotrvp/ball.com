from flask import Flask, jsonify, request, Blueprint # type: ignore
import logging
from app.service.message_service import MessageService

message_blueprint = Blueprint('message', __name__)

app = Flask(__name__)
message_service = MessageService()

@app.route('/', methods=['POST'])
def send_message():
    data = request.json
    message = data.get('message')
    try:
        message_service.send_message(message)
        return jsonify({'message': 'Message sent successfully'}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/receive', methods=['GET'])
def receive_message():
    message = message_service.receive_message()
    if message:
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': 'No message available'}), 404

if __name__ == '__main__':
    app.run(debug=True)
