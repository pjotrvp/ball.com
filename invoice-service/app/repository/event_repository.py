import uuid
from esdbclient import (EventStoreDBClient)# type: ignore
import traceback
from app.config import Config
import json
import time
import logging


class EventRepository:
    def __init__(self, connection_string=Config.EVENTSTOREDB_CONNECTIONSTRING):
        logging.basicConfig(level=logging.DEBUG)
        logger = logging.getLogger(__name__)
        self.client = EventStoreDBClient(connection_string)
        logger.debug("Succesfully connected to eventstore db")

    def append_event(self, stream_name, event_type, data):
        event_id = str(uuid.uuid4())
        event = {
            'event_id': event_id,
            'event_type': event_type,
            'data': data
        }
        self.client.append_to_stream(stream_name, [event])

    def read_events(self, stream_name):
        events = self.client.read_stream(stream_name)
        return events

