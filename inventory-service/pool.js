const mysql = require('mysql2')
const read = require('./src/configs/read.db.config')
const write = require('./src/configs/write.db.config')

const writePool = mysql.createPool(write)
const readPool = mysql.createPool(read)

const seed = () => {
    writePool.getConnection((err, connection) => {
        if (err) throw err;    
        console.log('Connected to the write database')
    })
    
    readPool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected to the read database')
    })
}

module.exports = {
    writePool,
    readPool,
    seed,
}