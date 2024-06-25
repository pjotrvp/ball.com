require('dotenv').config()
const express = require('express')
const { seedDatabases } = require('./pool')
const bodyParser = require('body-parser')
const RabbitMQConsumer = require('./src/services/rabbitmq/consumer.service')
const productRoutes = require('./src/routes/product.routes')

const app = express()
const port = process.env.NODE_DOCKER_PORT || 9090

seedDatabases()
new RabbitMQConsumer().connectAndListen()

app.use(bodyParser.json())

app.use('/api', productRoutes)

app.all('*', (req, res, next) => {
  next({ status: 404, message: 'Endpoint ' + req.url + ' not found' })
})

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message })
})

app.listen(port, () => {
  console.log(`Inventory service initiated on port ${port}`)
})