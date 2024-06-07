FROM python:3.9-slim
WORKDIR /app
COPY customer-data-service/app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY  customer-data-service/app .
EXPOSE 5000
CMD ["python", "app.py"]
