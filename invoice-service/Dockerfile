FROM python:3.9-slim
WORKDIR /app
COPY invoice-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY  invoice-service/ .
EXPOSE 5000
CMD ["python", "app.py"]
