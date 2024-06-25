from flask import Flask, jsonify, request # type: ignore
import logging
import pika # type: ignore
import json
from app import connect_to_rabbitmq, create_app, initialize_database
from sqlalchemy.exc import OperationalError # type: ignore


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = create_app()

#Connect to Mysql Write
try:
    initialize_database(app)
except OperationalError:
    logger.critical("Could not initialize database after multiple attempts, exiting.")
    exit(1)

# Connect to RabbitMQ
try:
    rabbitmq_connection = connect_to_rabbitmq()
except pika.exceptions.AMQPConnectionError:
    logger.critical("Could not connect to RabbitMQ after multiple attempts, exiting.")
    exit(1)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    
