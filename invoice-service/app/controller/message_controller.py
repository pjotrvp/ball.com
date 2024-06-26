from flask import Flask, jsonify, request, Blueprint # type: ignore
import logging
from app.service.message_service import MessageService

message_blueprint = Blueprint('message', __name__)

app = Flask(__name__)
message_service = MessageService()

@message_blueprint.route('/send', methods=['POST'])
def send_message():
    data = request.json
    message = data.get('message')
    try:
        message_service.send_message(message)
        return jsonify({'message': 'Message sent successfully'}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@message_blueprint.route('/receive', methods=['GET'])
def receive_message():
    message = message_service.receive_message()
    if message:
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': 'No message available'}), 404
