const express = require('express')
const app = express()
const port = 9090

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Inventory service initiated on port ${port}`)
})