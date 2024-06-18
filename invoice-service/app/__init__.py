from flask import Flask # type: ignore

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    
    from app.controller.invoice_controller import invoice_blueprint

    
    # Register all blueprints
    app.register_blueprint(invoice_blueprint, url_prefix='/invoice')

    
    return app