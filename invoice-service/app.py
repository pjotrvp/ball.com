from flask import Flask, jsonify, request # type: ignore
import pika # type: ignore
import json
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    
