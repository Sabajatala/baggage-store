const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authMiddleware = require('../authMiddleware');

// Routes
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/logout', authController.logout);

module.exports = router;