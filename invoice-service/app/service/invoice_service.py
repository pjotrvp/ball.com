from app.repository.invoice_repository import InvoiceRepository

class InvoiceService:
    def __init__(self):
        self.repository = InvoiceRepository()