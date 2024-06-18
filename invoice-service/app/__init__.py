from flask import Flask # type: ignore

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    
    from app.controller.invoice_controller import invoice_blueprint
    from app.controller.message_controller import message_blueprint

    
    # Register all blueprints
    app.register_blueprint(invoice_blueprint, url_prefix='/invoice')
    app.register_blueprint(message_blueprint, url_prefix='/message')

    
    return app