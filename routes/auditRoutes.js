const express = require('express');
const router = express.Router();
const auditController = require('../controllers/AuditController');
const authMiddleware = require('../authMiddleware');

// Fetch all audit logs (authenticated users only)
router.get('/', authMiddleware, auditController.getAudits);

module.exports = router;