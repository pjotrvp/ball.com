const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');

router.get('/products', controller.getProducts);
router.get('/products/:id', controller.getProduct);
router.post('/products', controller.createProduct);
router.put('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);

module.exports = router;