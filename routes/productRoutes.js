const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const authMiddleware = require('../authMiddleware');

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', authMiddleware, ProductController.createProduct);
router.put('/:id', authMiddleware, ProductController.updateProduct);
router.delete('/:id', authMiddleware, ProductController.deleteProduct);

module.exports = router;