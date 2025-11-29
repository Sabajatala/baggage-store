const express = require('express');
const router = express.Router();
const SessionProductController = require('../controllers/SessionController');


router.post('/insert', SessionProductController.sessionProductInsert);
router.get('/list', SessionProductController.sessionProductList);
router.delete('/delete/:id', SessionProductController.sessionProductDelete);
router.get('/check', (req, res) => {
  console.log(`Session check for ${req.sessionID}:`, req.session.products || []);
  res.json({
    sessionID: req.sessionID,
    products: req.session.products || [],
    cookies: req.headers.cookie || 'none'
  });
});
module.exports = router; 
