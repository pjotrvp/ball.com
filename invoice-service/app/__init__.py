import logging
import pika # type: ignore
from flask import Flask # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from sqlalchemy.exc import OperationalError # type: ignore
import time

db = SQLAlchemy()

def create_app():
    logging.basicConfig(level=logging.DEBUG)
    logger = logging.getLogger(__name__)

    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    logger.debug("Initializing databases...")
    db.init_app(app)

    from app.controller.invoice_controller import invoice_blueprint
    from app.controller.message_controller import message_blueprint

    logger.debug("Registering blueprints...")
    app.register_blueprint(invoice_blueprint, url_prefix='/invoice')
    app.register_blueprint(message_blueprint, url_prefix='/message')

    logger.info("Application setup complete.")

    return app

def initialize_database(app):
    logging.basicConfig(level=logging.DEBUG)
    logger = logging.getLogger(__name__)
    
    with app.app_context():
        retry_attempts = 5
        for attempt in range(retry_attempts):
            try:
                # Create tables for read database
                with db.get_engine(app, bind='read').connect() as conn:
                    db.Model.metadata.create_all(bind=conn)
                logger.info("Successfully created all read database tables and connected to the database.")

                # Create tables for write database
                with db.get_engine(app).connect() as conn:
                    db.Model.metadata.create_all(bind=conn)
                logger.info("Successfully created all write database tables and connected to the database.")
                
                break
            except OperationalError as e:
                logger.error(f"Failed to connect to the database (attempt {attempt + 1}/{retry_attempts}): {e}")
                if attempt < retry_attempts - 1:
                    time.sleep(5)  # Wait before retrying
                else:
                    raise


def connect_to_rabbitmq():
    logging.basicConfig(level=logging.DEBUG)
    logger = logging.getLogger(__name__)
    retry_attempts = 5
    for attempt in range(retry_attempts):
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
            logger.info("Successfully connected to RabbitMQ.")
            return connection
        except pika.exceptions.AMQPConnectionError as e:
            logger.error(f"Failed to connect to RabbitMQ (attempt {attempt + 1}/{retry_attempts}): {e}")
            if attempt < retry_attempts - 1:
                time.sleep(5)  # Wait before retrying
            else:
                raise
