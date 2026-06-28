const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/users', authMiddleware, requireRole('admin'), authController.getAllUsers);
router.get('/users/search', authMiddleware, requireRole('admin'), authController.searchUsers);
router.delete('/users/:id', authMiddleware, requireRole('admin'), authController.deleteUser);

module.exports = router;
