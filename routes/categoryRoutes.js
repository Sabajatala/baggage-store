const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');
const authMiddleware = require('../authMiddleware');

// Unprotected routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes
router.post('/', authMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const CategoryController = require('../controllers/CategoryController');


// router.get('/', CategoryController.getAllCategories); 
// router.get('/:id', CategoryController.getCategoryById); 
// router.post('/', CategoryController.createCategory); 
// router.put('/:id', CategoryController.updateCategory); 
// router.delete('/:id', CategoryController.deleteCategory); 

// module.exports = router;