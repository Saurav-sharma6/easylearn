const express = require('express');
const router = express.Router();
const { authenticateToken, roleMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/analytics', [authenticateToken, roleMiddleware(['admin'])],  adminController.getAnalytics);

module.exports = router;