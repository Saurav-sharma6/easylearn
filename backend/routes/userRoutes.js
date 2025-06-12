const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes for users
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/:id', userController.getProfile);
router.put('/:id', userController.updateProfile);

module.exports = router;
