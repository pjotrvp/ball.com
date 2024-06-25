const { readPool, writePool } = require('../../pool')
const readService = require('../services/databases/read.service')
const writeService = require('../services/databases/write.service')
const RabbitMQPublisher = require('../services/rabbitmq/publisher.service')
const publisher = new RabbitMQPublisher()

const getProducts = async (req, res, next) => {
    try {
        const products = await readService.getAllProducts()
        res.status(200).json(products)
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const getProduct = async (req, res, next) => {
    const { id } = req.params

    try {
        const product = await readService.getProductById(id)
        res.status(200).json(product)
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const createProduct = async (req, res, next) => {
    try {
        const id = await writeService.createProduct(req.body)
        res.status(200).json({ id, message: 'Product created' })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const updateProduct = async (req, res, next) => {
    try {
        await writeService.updateProduct(req.params.id, req.body)
        res.status(200).json({ message: 'Product updated' })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        await writeService.deleteProduct(req.params.id)
        res.status(200).json({ message: 'Product deleted' })
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
