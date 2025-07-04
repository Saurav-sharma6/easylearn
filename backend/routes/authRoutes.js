// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {authenticateToken, roleMiddleware} = require('../middleware/auth');

router.post('/register', authController.register); //register route
router.post('/login', authController.login); // login route
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/', [authenticateToken, roleMiddleware(['admin'])], authController.getAllUsers); //To get all the users (by admin).
router.post('/logout', authenticateToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/count', [authenticateToken, roleMiddleware(['admin'])], authController.getUserCount);

module.exports = router;