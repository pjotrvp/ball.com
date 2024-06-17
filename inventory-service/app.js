require('dotenv').config()
const express = require('express')
const { seed } = require('./pool')
const { receive } = require('./src/events/receive')
const { send } = require('./src/events/send')
const bodyParser = require('body-parser')

const productRoutes = require('./src/routes/product.routes')

const app = express()
const port = process.env.NODE_DOCKER_PORT || 9090

seed()

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

receive().then(async () => {
  console.log("Listening for messages...")
  await new Promise(function () { })
})
.catch((res) => {
  console.log("Error while receiving message!", res)
  process.exit(-1)
})

// make loop every 10 seconds
setInterval(() => {
  send().then(() => console.log("done!"))
  .catch((res) => {
      console.log("Error in publishing message!", res);
      process.exit(-1);
  });
}, 10000)