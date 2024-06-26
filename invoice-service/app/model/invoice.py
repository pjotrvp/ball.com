from app import db

class Invoice(db.Model):
    __tablename__ = 'invoices'
    invoiceId = db.Column(db.Integer, primary_key=True)
    customerId = db.Column(db.String(100))
    orderId = db.Column(db.String(100))
    status = db.Column(db.String(30))


    def to_dict(self):
        return {
            'invoicId': self.invoiceId,
            'customerId': self.customerId,
            'orderId': self.orderId,
            'status': self.status
        }