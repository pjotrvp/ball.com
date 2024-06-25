from config import Config
from esdbclient import EventStoreDBClient, NewEvent, StreamState # type: ignore
import traceback
import uuid
import json
import time
import logging


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

client = EventStoreDBClient(
    uri=Config.EVENTSTOREDB_CONNECTIONSTRING
)

def connectEventStore():
    while True:
        try:
            client
            logger.info("Succesfully connected to EventStoredb")
            return client
            break
        except:
            logger.debug("Failed to connect to Eventstoredb, retrying in 10 seconds....")
            traceback.print_exc()
            time.sleep(10)


def appendEvent(stream_name, events_array, current_version):
    client.append_to_stream(
    stream_name,
    events = [events_array],
    current_version = current_version
    )
    

def getEvents(stream_name):
    events = client.get_stream(stream_name)
    
    for event in events:
        print(event)
    
