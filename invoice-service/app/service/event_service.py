from app.repository.event_repository import EventRepository

class EventService:
    def __init__(self):
        self.event_repository = EventRepository()

    def create_event(self, stream_name, event_type, data):
        self.event_repository.append_event(stream_name, event_type, data)

    def get_events(self, stream_name):
        return self.event_repository.read_events(stream_name)
