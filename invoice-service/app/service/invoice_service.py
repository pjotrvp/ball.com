from app.repository.invoice_repository import InvoiceRepository

class InvoiceService:
    def __init__(self):
        self.invoice_repository = InvoiceRepository()

    def getInvoices(self):
        return self.invoice_repository.getInvoices()
    
    def getInvoicesById(self, id):
        return self.invoice_repository.getInvoiceById(id)
    
    def createInvoice(self, customer_name, amount, status):
        return self.invoice_repository.createInvoice(customer_name, amount, status)
    
    def updateInvoice(self, id, customer_name, amount, status):
        return self.invoice_repository.updateInvoice(id, customer_name, amount, status)
    
    def deleteInvoice(self, id):
        return self.invoice_repository.deleteInvoice(id)