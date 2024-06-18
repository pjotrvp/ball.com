from app import db

class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(50))
    amount = db.Column(db.Float)
    status = db.Column(db.String(20))