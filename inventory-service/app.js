const express = require('express')
const bodyParser = require('body-parser')

const productRoutes = require('./src/routes/product.routes')

const app = express()
const port = 9090

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