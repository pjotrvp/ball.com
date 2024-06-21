const { readPool } = require('../../../pool');

async function createProduct(payload) {
    const query = `INSERT INTO products (id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)`;
    const params = [payload.id, payload.name, payload.description, payload.price, payload.stock];
    
    try {
        readPool.query(query, params, (error, results) => {
            if (error) throw error;
            console.log("[W | <=] Product created in read database: ", payload);
        });
    } catch (error) {
        throw error;
    }
}

async function updateProduct(id, payload) {
    const query = `UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`;
    const params = [payload.name, payload.description, payload.price, payload.stock, id];
    
    try {
        readPool.query(query, params, (error, results) => {
            if (error) throw error;
            console.log("[W | <=] Product updated in read database: ", payload);
        });
    } catch (error) {
        throw error;
    }
}

async function deleteProduct(id) {
    const query = `DELETE FROM products WHERE id = ?`;
    
    try {
        readPool.query(query, [id], (error, results) => {
            if (error) throw error;
            console.log("[W | <=] Product deleted from read database: ", id);
        });
    } catch (error) {
        throw error;
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

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getAllProducts,
};
