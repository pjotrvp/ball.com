from flask import Flask, jsonify, request, Blueprint # type: ignore
import pika # type: ignore
import json

from app.service.invoice_service import InvoiceService

invoice_blueprint = Blueprint('invoice', __name__)
invoice_service = InvoiceService()



@invoice_blueprint.route('/', methods=['GET'])
def getInvoices():
    invoices = invoice_service.getInvoices()
    if invoices:
        return jsonify({'Invoices': invoices}), 200
    else:
        return jsonify({'message': 'No invoices available'}), 404

@invoice_blueprint.route('/<int:invoice_id>', methods=['GET'])
def getInvoice():
    return jsonify({"message": "Get invoice/ called"})


@invoice_blueprint.route('/', methods=['POST'])
def createInvoice():
    data = request.json
    customer_name = data.get('customer_name')
    amount = data.get('amount')
    status = data.get('status')
    res = invoice_service.createInvoice(customer_name, amount, status)
    return jsonify({'message': f'ID of invoice is {res}'})


@invoice_blueprint.route('/<int:invoice_id>', methods=['PUT'])
def updateInvoice():
    return jsonify({"message": "Put invoice/:id called"})


@invoice_blueprint.route('/<int:invoice_id>', methods=['DELETE'])
def delInvoice():
    return jsonify({"message": "Delete invoice called"})