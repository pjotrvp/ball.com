const mysql = require('mysql2')
const read = require('./src/configs/read.db.config')
const write = require('./src/configs/write.db.config')

const writePool = mysql.createPool(write)
const readPool = mysql.createPool(read)

const seedQuery = `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL
);`

const seedDatabases = () => {
    writePool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected to the write database')

        connection.query(seedQuery, function(error, results, fields) {
            connection.release()
            if (error) throw error

            console.log('Write database seeded')
        })

        connection.query('TRUNCATE TABLE products', function(error, results, fields) {
            if (error) throw error

            console.log('Table products truncated')
        })
    })
    
    readPool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected to the read database')
    
        connection.query(seedQuery, function(error, results, fields) {
            connection.release()
            if (error) throw error

            console.log('Read database seeded')
        })

        connection.query('TRUNCATE TABLE products', function(error, results, fields) {
            if (error) throw error

            console.log('Table products truncated')
        })
    })
}

module.exports = {
    writePool,
    readPool,
    seedDatabases,
}