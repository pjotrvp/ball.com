from flask import Flask, jsonify, request, Blueprint # type: ignore
import pika # type: ignore
import json

from app.service.invoice_service import InvoiceService

invoice_blueprint = Blueprint('invoice', __name__)
service = InvoiceService()



@invoice_blueprint.route('/', methods=['GET'])
def getInvoices():
    return jsonify({"message": "Get invoices called"})


@invoice_blueprint.route('/<int:invoice_id>', methods=['GET'])
def getInvoice():
    return jsonify({"message": "Get invoice/ called"})


@invoice_blueprint.route('/', methods=['POST'])
def createInvoice():
    return jsonify({"message": "Post invoice called"})


@invoice_blueprint.route('/<int:invoice_id>', methods=['PUT'])
def updateInvoice():
    return jsonify({"message": "Put invoice/:id called"})


@invoice_blueprint.route('/<int:invoice_id>', methods=['DELETE'])
def delInvoice():
    return jsonify({"message": "Delete invoice called"})