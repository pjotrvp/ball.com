const { writePool } = require('../../../pool');
const eventStore = require("../../stores/events.store");
const RabbitMQPublisher = require('../rabbitmq/publisher.service')
const publisher = new RabbitMQPublisher()

async function createProduct(body) {
    const query = `INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)`;
    const { name, description, price, stock } = body;

    if (!name) throw new Error('Name is required');
    if (!description) throw new Error('Description is required');
    if (!price) throw new Error('Price is required');
    if (!stock) throw new Error('Stock is required');

    try {
        const results = await new Promise((resolve, reject) => {
            writePool.query(query, [name, description, price, stock], (error, results) => {
                if (error) return reject(error);                
                if (!results.insertId) return reject(new Error('Product not created'));

                resolve(results);
            });
        });

        const payload = { id: results.insertId, name, description, price, stock };

        eventStore.appendToStream(`inventory-stream`, "ProductCreated", payload);

        const command = { type: 'ProductCreated', payload };
        publisher.publish(command);

        return results.insertId;
    } catch (error) {
        throw error;
    }
}

async function updateProduct(id, body) {
    const query = `UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`;
    const { name, description, price, stock } = body;

    try {
        const results = await new Promise((resolve, reject) => {
            writePool.query(query, [name, description, price, stock, id], (error, results) => {
                if (error) return reject(error);
                if (results.affectedRows < 1) return reject(new Error('Product not found'));

                resolve(results);
            });
        });

        const command = { type: 'ProductUpdated', payload: { id, name, description, price, stock } };
        publisher.publish(command);
    } catch (error) {
        throw error;
    }
}

async function deleteProduct(id) {
    const query = 'DELETE FROM products WHERE id = ?';

    try {
        const results = await new Promise((resolve, reject) => {
            writePool.query(query, [id], (error, results) => {
                if (error) return reject(error);
                if (results.affectedRows < 1) return reject(new Error('Product not found'));

                resolve(results);
            });
        });

        const command = { type: 'ProductDeleted', payload: { id } };
        publisher.publish(command);
    } catch (error) {
        throw error;
    }
}

async function lowerStockOfProductsInOrder(order) {
    const { products } = order;
    const query = `UPDATE products SET stock = stock - ? WHERE id = ?`;

    try {
        for (const product of products) {
            await new Promise((resolve, reject) => {
                writePool.query(query, [product.quantity, product.id], (error, results) => {
                    if (error) return reject(error);
                    if (results.affectedRows < 1) return reject(new Error(`Product not found: ${product.id}`));

                    resolve(results);

                    const command = { type: 'ProductStockLowered', payload: { id: product.id, quantity: product.quantity } };
                    publisher.publish(command);
                });
            });
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    lowerStockOfProductsInOrder
};