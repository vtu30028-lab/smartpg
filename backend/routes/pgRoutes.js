const express = require('express');
const router = express.Router();
const pgController = require('../controllers/pgController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.get('/pgs', pgController.getAllPGs);
router.get('/pgs/:id', pgController.getPGById);
router.post('/pg', authMiddleware, requireRole('owner', 'admin'), pgController.createPG);
router.put('/pg/:id', authMiddleware, requireRole('owner', 'admin'), pgController.updatePG);
router.delete('/pg/:id', authMiddleware, requireRole('owner', 'admin'), pgController.deletePG);
router.post('/review', authMiddleware, requireRole('student'), pgController.addReview);
router.post('/ai-search', pgController.aiSearch);

module.exports = router;
