const { readPool, writePool } = require('../../pool')
const RabbitMQPublisher = require('../services/rabbitmq/publisher.service')
const publisher = new RabbitMQPublisher()

const getProducts = async (req, res, next) => {
    try {
        readPool.query('SELECT * FROM products', (error, results, fields) => {
            connection.release()
            if (error) throw error

            if (results.length === 0) return next({ status: 404, message: 'No products found' })

            res.status(200).json(results)
        })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const getProduct = async (req, res, next) => {
    const { id } = req.params

    try {
        readPool.query('SELECT * FROM products WHERE id = ?', [id], (error, results, fields) => {
            connection.release()
            if (error) throw error

            if (results.length === 0) return next({ status: 404, message: 'Product not found' })

            res.status(200).json(results)
        })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const createProduct = async (req, res, next) => {
    const { name, description, price, stock } = req.body

    if (!name) return next({ status: 404, message: 'Name is required' })
    if (!description) return next({ status: 404, message: 'Description is required' })
    if (!price) return next({ status: 404, message: 'Price is required' })
    if (!stock) return next({ status: 404, message: 'Stock is required' })

    try {
        const query = `INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)`
        const params = [name, description, price, stock]

        writePool.query(query, params, (error, results, fields) => {
            if (error) throw error

            if (!results.insertId) return next({ status: 404, message: 'Product not created' })

            const command = { type: 'CreateProduct', payload: { id: results.insertId, name, description, price, stock } }
            publisher.publish(command)

            res.status(200).json({ id: results.insertId, message: 'Product created' })
        })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const updateProduct = async (req, res, next) => {
    const { id } = req.params
    const { name, description, price, stock } = req.body

    try {
        const query = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?'
        const params = [name, description, price, stock, id]

        writePool.query(query, params, (error, results, fields) => {
            if (error) throw error

            if (results.affectedRows < 1) return next({ status: 404, message: 'Product not found' })

            const command = { type: 'UpdateProduct', payload: { id, name, description, price, stock } }
            publisher.publish(command)

            res.status(200).json({ message: 'Product updated' })
        })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const deleteProduct = async (req, res, next) => {
    const { id } = req.params

    try {
        const query = 'DELETE FROM products WHERE id = ?'
        const params = [id]

        writePool.query(query, params, (error, results, fields) => {
            if (error) throw error

            if (results.affectedRows < 1) return next({ status: 404, message: 'Product not found' })

            const command = { type: 'DeleteProduct', payload: { id } }
            publisher.publish(command)

            res.status(200).json({ message: 'Product deleted' })
        })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
}
