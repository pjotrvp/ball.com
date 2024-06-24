const { readPool } = require('../../../pool');

async function createProduct(payload) {
    const query = `INSERT INTO products (id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)`;
    const params = [payload.id, payload.name, payload.description, payload.price, payload.stock];

    if (!payload.id) throw new Error('ID is required');
    if (!payload.name) throw new Error('Name is required');
    if (!payload.description) throw new Error('Description is required');
    if (!payload.price) throw new Error('Price is required');
    if (!payload.stock) throw new Error('Stock is required');

    try {
        await new Promise((resolve, reject) => {
            readPool.query(query, params, (error, results) => {
                if (error) return reject(error);
                if (!results.insertId) return reject(new Error('Product not created'));
                
                console.log("[W | <=] Product created in read database: ", payload);
                resolve(results);
            });
        });
    } catch (error) {
        throw new Error(error.message || 'Error creating product in read database');
    }
}

async function updateProduct(id, payload) {
    const query = `UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`;
    const params = [payload.name, payload.description, payload.price, payload.stock, id];

    try {
        await new Promise((resolve, reject) => {
            readPool.query(query, params, (error, results) => {
                if (error) return reject(error);
                if (results.affectedRows < 1) return reject(new Error('Product not found'));

                console.log("[W | <=] Product updated in read database: ", payload);
                resolve(results);
            });
        });
    } catch (error) {
        throw new Error(error.message || 'Error updating product in read database');
    }
}

async function deleteProduct(id) {
    const query = `DELETE FROM products WHERE id = ?`;

    try {
        await new Promise((resolve, reject) => {
            readPool.query(query, [id], (error, results) => {
                if (error) return reject(error);
                if (results.affectedRows < 1) return reject(new Error('Product not found'));

                console.log("[W | <=] Product deleted from read database: ", id);
                resolve(results);
            });
        });
    } catch (error) {
        throw new Error(error.message || 'Error deleting product from read database');
    }
}

async function getProductById(id) {
    const query = `SELECT * FROM products WHERE id = ?`;
    
    try {
        const results = await new Promise((resolve, reject) => {
            readPool.query(query, [id], (error, results) => {
                if (error) return reject(error);
                resolve(results[0]);
            });
        });

        if (!results) {
            throw new Error('Product not found');
        }

        return results;
    } catch (error) {
        throw new Error(error.message || 'Error fetching product from read database');
    }
}

async function getAllProducts() {
    const query = `SELECT * FROM products`;
    
    try {
        const results = await new Promise((resolve, reject) => {
            readPool.query(query, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        if (results.length === 0) {
            throw new Error('No products found');
        }

        return results;
    } catch (error) {
        throw new Error(error.message || 'Error fetching products from read database');
    }
}

async function lowerStockOfProduct(id, quantity) {
    const query = `UPDATE products SET stock = stock - ? WHERE id = ?`;

    try {
        await new Promise((resolve, reject) => {
            readPool.query(query, [quantity, id], (error, results) => {
                if (error) return reject(error);
                if (results.affectedRows < 1) return reject(new Error('Product not found'));

                console.log("[W | <=] Stock lowered in read database: ", id, quantity);
                resolve(results);
            });
        });
    } catch (error) {
        throw new Error(error.message || 'Error lowering stock in read database');
    }
}

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getAllProducts,
    lowerStockOfProduct,
};
