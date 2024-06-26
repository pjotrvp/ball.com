from sqlite3 import OperationalError
from app import db
from app.model.invoice import Invoice
from sqlalchemy import select, update, delete # type: ignore
import pika # type: ignore
from app.config import Config
from app.repository.event_repository import EventRepository
from app.repository.message_repository import MessageRepository


class InvoiceRepository:
    #def __init__(self):
        

    def getInvoices(self):
        try:
            # Construct the select query
            query = select(Invoice).order_by(Invoice.invoiceId)

            # Execute the query using the 'read' bind
            invoices = db.session.execute(query.execution_options(bind=db.get_engine(bind='read')))

            # Fetch all results
            results = invoices.scalars().all()

            # Convert results to a list of dictionaries
            invoice_list = [invoice.to_dict() for invoice in results]
        
            return invoice_list
        except OperationalError as e:
            print(f"Error fetching invoices from read database: {e}")
            return None

    def getInvoiceById(self, id):
        try:
            # Construct the select query
            query = select(Invoice).where(Invoice.invoiceId == id).order_by(Invoice.id)

            # Execute the query using the 'read' bind
            invoice = db.session.execute(query.execution_options(bind=db.get_engine(bind='read')))

            # Fetch all results
            results = invoice.scalars().all()
            
            # Convert results to a list of dictionaries
            invoice_list = [invoice.to_dict() for invoice in results]
        
            return invoice_list
        except OperationalError as e:
            print(f"Error fetching invoices from read database: {e}")
            return None
    
    def createInvoice(self, customerId, orderId, status):
        try:
            # Create new invoice object for the write database
            new_invoice = Invoice(
                customerId=str(customerId),
                orderId=str(orderId),
                status=status  # Default to "Not paid" for the write database
            )

            # Write database transaction
            with db.session(bind=db.get_engine(bind='write')) as session_write:
                session_write.add(new_invoice)
                session_write.commit()
                id = new_invoice.invoiceId  # Get the ID of the newly created invoice
                return id

        except Exception as e:
            print(f"Error creating invoice in write database: {e}")
            if 'session_write' in locals():
                session_write.rollback()
            return f'Error creating in write: {str(e)}'
    
    def updateInvoice(self, id, customerId, orderId, status):
        try:
            new_invoice = {
                'customerId': customerId,
                'orderId': orderId,
                'status': status
            }
            # Construct the select query
            query = update(Invoice).where(Invoice.invoiceId == id).values(**new_invoice)

            # Execute the query using the 'read' bind
            db.session.execute(query.execution_options(bind=db.get_engine(bind='write')))
            db.session.commit()

            db.session.execute(query.execution_options(bind=db.get_engine(bind='read')))
            db.session.commit()
            return True
        except OperationalError as e:
            print(f"Error fetching invoices from read database: {e}")
            db.session.rollback()
            return False
    
    def deleteInvoice(self, id):
        try:
            # Construct the select query
            query = delete(Invoice).where(Invoice.invoiceId == id)

            # Execute the query using the 'read' bind
            db.session.execute(query.execution_options(bind=db.get_engine(bind='write')))
            db.session.commit()
            return True
        except OperationalError as e:
            print(f"Error fetching invoices from read database: {e}")
            db.session.rollback()
            return False
