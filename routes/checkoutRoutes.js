const express = require('express');
const router = express.Router();
const { storeCheckout, getAllCheckouts, updateCheckoutStatus } = require('../controllers/CheckoutController');
const authMiddleware = require('../authMiddleware');

router.post('/store', storeCheckout);
router.get('/', authMiddleware, getAllCheckouts);
router.put('/:id/status', authMiddleware, updateCheckoutStatus);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { storeCheckout, getAllCheckouts } = require('../controllers/CheckoutController');

// router.post('/store', storeCheckout);
// router.get('/', getAllCheckouts);

// module.exports = router;