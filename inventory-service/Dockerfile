FROM node:12-alpine3.14

RUN mkdir /app
ADD ./inventory-service/. /app
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9090

CMD [ "node", "app.js" ]