const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', authenticateToken, userController.getMe);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updatePassword);
router.post('/forgot-password', userController.forgotPassword);

module.exports = router;
