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

@invoice_blueprint.route('/<int:id>', methods=['GET'])
def getInvoice(id):
    invoice = invoice_service.getInvoicesById(id)
    if invoice:
        return jsonify({"Invoice": invoice}), 200
    else:
        return jsonify({"message": "No invoice with that id found"}), 404


@invoice_blueprint.route('/', methods=['POST'])
def createInvoice():
    data = request.json
    customer_name = data.get('customer_name')
    amount = data.get('amount')
    status = data.get('status')
    res = invoice_service.createInvoice(customer_name, amount, status)
    return jsonify({'message': f'ID of invoice is {res}'})


@invoice_blueprint.route('/<int:id>', methods=['PUT'])
def updateInvoice(id):
    data = request.json
    customer_name = data.get('customer_name')
    amount = data.get('amount')
    status = data.get('status')
    res = invoice_service.updateInvoice(id, customer_name, amount, status)
    return jsonify({'message': f'Change of invoice is {res}'})


@invoice_blueprint.route('/<int:id>', methods=['DELETE'])
def deleteInvoice(id):
    res = invoice_service.deleteInvoice(id)
    return jsonify({'message': f'Deletion of invoice with id:{id} was {res}'})