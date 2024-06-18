from flask import Blueprint, request, jsonify # type: ignore
from app.service.message_service import MessageService

message_blueprint = Blueprint('messages', __name__)
service = MessageService()

@message_blueprint.route('/send', methods=['POST'])
def send_message():
    data = request.json
    message = data.get('message')
    try:
        service.send_message(message)
        return jsonify({'status': 'Message sent'}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@message_blueprint.route('/receive', methods=['GET'])
def receive_message():
    message = service.receive_message()
    if message:
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': 'No messages in queue'}), 200
