// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register); //register route
router.post('/login', authController.login); // login route
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/', [auth, adminMiddleware], authController.getAllUsers); //To get all the users (by admin).

module.exports = router;