import uuid
from esdbclient import EventStoreDBClient, NewEvent, StreamState # type: ignore
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

    def append_event(self, stream_name, event_type, event_data):
        event_id = str(uuid.uuid4())
        logging.basicConfig(level=logging.DEBUG)
        logger = logging.getLogger(__name__)
        logger.info(f'self:{self}, stream_name:{stream_name}, event_type:{event_type}, data:{event_data}')
        event = NewEvent(
            id= event_id,
            type= event_type,
            data= b'{event_data}',
        )
        logger.info(f'data:{event.data}')
        self.client.append_to_stream(stream_name, events=[event], current_version=StreamState.ANY,)

    def read_events(self, stream_name):
        events = self.client.read_stream(stream_name)
        return events

