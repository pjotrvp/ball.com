from sqlite3 import OperationalError
from app import db
from app.model.invoice import Invoice
from sqlalchemy import select, update, delete # type: ignore
import pika # type: ignore
from app.config import Config

class InvoiceRepository:
    #def __init__(self):
        

    def getInvoices(self):
        try:
            # Construct the select query
            query = select(Invoice).order_by(Invoice.id)

            # Execute the query using the 'read' bind
            invoices = db.session.execute(query.execution_options(bind=db.get_engine(bind='read')))

            # Fetch all results
            results = invoices.fetchall()
            return results
        except OperationalError as e:
            print(f"Error fetching invoices from read database: {e}")
            return None

    def getInvoiceById(self, id):
        try:
            # Construct the select query
            query = select(Invoice).where(Invoice.id == id).order_by(Invoice.id)

            # Execute the query using the 'read' bind
            invoice = db.session.execute(query.execution_options(bind=db.get_engine(bind='read')))

            # Fetch all results
            results = invoice.fetchall()
            return results
        except OperationalError as e:
            print(f"Error fetching invoices from read database: {e}")
            return None
    
    def createInvoice(self, customer_name, amount, status):
        try:
            with db.session(bind=db.get_engine(bind='write')) as session:
                new_invoice = Invoice(
                    customer_name=customer_name,
                    amount=amount,
                    status=status
                )
                session.add(new_invoice)
                session.commit()

            with db.session(bind=db.get_engine(bind='read')) as session:
                new_invoice = Invoice(
                    customer_name=customer_name,
                    amount=amount,
                    status=status
                )
                session.add(new_invoice)
                session.commit()            

                return new_invoice.id  # Return the ID of the newly created invoice
        except Exception as e:
            print(f"Error creating invoice: {e}")
            session.rollback()
            return None
    
    def updateInvoice(self, id, customer_name, amount, status):
        try:
            new_invoice = Invoice(
                id=id,
                customer_name= customer_name,
                amount= amount,
                status= status
            )
            # Construct the select query
            query = update(Invoice).where(Invoice.id == id).values(**new_invoice)

            # Execute the query using the 'read' bind
            db.session.execute(query.execution_options(bind=db.get_engine(bind='write')))
            db.session.commit()
            return True
        except OperationalError as e:
            print(f"Error fetching invoices from read database: {e}")
            db.session.rollback()
            return False
    
    def deleteInvoice(self, id):
        try:
            # Construct the select query
            query = delete(Invoice).where(Invoice.id == id)

            # Execute the query using the 'read' bind
            db.session.execute(query.execution_options(bind=db.get_engine(bind='write')))
            db.session.commit()
            return True
        except OperationalError as e:
            print(f"Error fetching invoices from read database: {e}")
            db.session.rollback()
            return False
