const { readPool, writePool } = require('../../pool')

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

                if (results.length === 0) return next({ status: 404, message: 'No products found' })

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

        readPool.getConnection((err, connection) => {
            if (err) {
                connection.release()
                throw err
            }

            connection.query('SELECT * FROM products WHERE id = ?', [id], (error, results, fields) => {
                connection.release()
                if (error) throw error

                if (results.length === 0) return next({ status: 404, message: 'Product not found' })

                res.status(200).json(results)
            })
        })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, stock } = req.body
        const queryWrite = 'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)'
        const queryRead = 'INSERT INTO products (id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)'
        const params = [name, description, price, stock]

        writePool.getConnection((err, connection) => {
            if (err) {
                connection.release()
                throw err
            }

            connection.query(queryWrite, params, (error, results, fields) => {
                connection.release()
                if (error) throw error

                if (!results.insertId) return next({ status: 404, message: 'Product not created' })

                readPool.getConnection((err, connection) => {
                    if (err) {
                        connection.release()
                        throw err
                    }

                    connection.query(queryRead, [results.insertId, ...params], (error, results, fields) => {
                        connection.release()
                        if (error) throw error

                        if (results.affectedRows < 1) return next({ status: 404, message: 'Product not created' })

                        res.status(200).json({ id: results.insertId, message: 'Product created' })
                    })
                })
            })
        })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, description, price, stock } = req.body
        const query = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?'
        const params = [name, description, price, stock, id]

        writePool.getConnection((err, connection) => {
            if (err) {
                connection.release()
                throw err
            }

            connection.query(query, params, (error, results, fields) => {
                connection.release()
                if (error) throw error

                if (results.affectedRows < 1) return next({ status: 404, message: 'Product not found' })

                readPool.getConnection((err, connection) => {
                    if (err) {
                        connection.release()
                        throw err
                    }

                    connection.query(query, params, (error, results, fields) => {
                        connection.release()
                        if (error) throw error

                        if (results.affectedRows < 1) return next({ status: 404, message: 'Product not found' })
                        
                        res.status(200).json({ message: 'Product updated' })
                    })
                })
            })
        })
    } catch (error) {
        next({ status: 404, message: error.message })
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        const query = 'DELETE FROM products WHERE id = ?'
        const params = [id]

        writePool.getConnection((err, connection) => {
            if (err) {
                connection.release()
                throw err
            }

            connection.query(query, params, (error, results, fields) => {
                connection.release()
                if (error) throw error

                if (results.affectedRows < 1) return next({ status: 404, message: 'Product not found' })

                readPool.getConnection((err, connection) => {
                    if (err) {
                        connection.release()
                        throw err
                    }

                    connection.query(query, params, (error, results, fields) => {
                        connection.release()
                        if (error) throw error

                        if (results.affectedRows < 1) return next({ status: 404, message: 'Product not found' })
                        
                        res.status(200).json({ message: 'Product deleted' })
                    })
                })
            })
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
