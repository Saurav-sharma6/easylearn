// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register); //register route
router.post('/login', authController.login); // login route
router.get('/', [auth, adminMiddleware], authController.getAllUsers); //To get all the users (by admin).

module.exports = router;