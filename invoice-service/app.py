from flask import Flask, jsonify, request # type: ignore
import logging
import pika # type: ignore
import json
import time
from app import create_app, initialize_database
from sqlalchemy.exc import OperationalError # type: ignore


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = create_app()

#Connect to Mysql Write
try:
    initialize_database(app)
except OperationalError:
    logger.error("Could not initialize database after multiple attempts, exiting.")
    exit(1)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
    
