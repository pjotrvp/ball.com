FROM node:16-alpine
WORKDIR /Order-Management
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]