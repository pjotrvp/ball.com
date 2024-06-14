const { readPool, writePool } = require('../../pool')

const products = {
    1: {
        id: 1,
        name: 'Product 1',
        description: 'Description of product 1',
        price: 100,
    },
}

const getProducts = async (req, res, next) => {
    try {
        readPool.getConnection((err, connection) => {
            if (err) {
                connection.release()
                throw err
            }

            connection.query('SELECT * FROM products', (error, results, fields) => {
                connection.release()
                if (error) throw error

                res.status(200).json(results)
            })
        })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params

        if (!products[id]) return next({ status: 404, message: 'Product not found' })

        res.status(200).json(products[id])
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

module.exports = {
    getProducts,
    getProduct,
}
