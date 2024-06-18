from app.repository.message_repository import MessageRepository

class MessageService:
    def __init__(self):
        self.repository = MessageRepository()

    def send_message(self, message):
        if not message:
            raise ValueError("No message provided")
        self.repository.send_message(message)

    def receive_message(self):
        return self.repository.receive_message()
