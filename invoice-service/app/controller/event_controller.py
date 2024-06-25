from flask import Blueprint, request, jsonify # type: ignore
from app.service.event_service import EventService

event_blueprint = Blueprint('event_blueprint', __name__)
event_service = EventService()

@event_blueprint.route('/events', methods=['POST'])
def create_event():
    data = request.json
    stream_name = data.get('stream_name')
    event_type = data.get('event_type')
    event_data = data.get('data')
    event_service.create_event(stream_name, event_type, event_data)
    return jsonify({"message": "Event created"}), 201

@event_blueprint.route('/events/<stream_name>', methods=['GET'])
def get_events(stream_name):
    events = event_service.get_events(stream_name)
    return jsonify(events), 200
