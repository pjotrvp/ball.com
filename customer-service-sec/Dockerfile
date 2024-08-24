FROM node:16-alpine
WORKDIR /Customer-Service-Sec
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "app.js"]