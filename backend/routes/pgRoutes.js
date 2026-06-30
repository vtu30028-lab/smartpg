const express = require('express');
const router = express.Router();
const pgController = require('../controllers/pgController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/upload', authMiddleware, requireRole('owner', 'admin'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Construct URL for frontend
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  res.status(201).json({ url: imageUrl });
});

router.get('/pgs', pgController.getAllPGs);
router.get('/pgs/:id', pgController.getPGById);
router.post('/pg', authMiddleware, requireRole('owner', 'admin'), pgController.createPG);
router.put('/pg/:id', authMiddleware, requireRole('owner', 'admin'), pgController.updatePG);
router.delete('/pg/:id', authMiddleware, requireRole('owner', 'admin'), pgController.deletePG);
router.post('/review', authMiddleware, requireRole('student'), pgController.addReview);
router.post('/ai-search', pgController.aiSearch);

module.exports = router;
