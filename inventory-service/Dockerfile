FROM node:16-alpine

WORKDIR /app

COPY inventory-service/package*.json .

RUN npm install

COPY inventory-service/ .

EXPOSE 9090

CMD [ "npm", "run", "start" ]