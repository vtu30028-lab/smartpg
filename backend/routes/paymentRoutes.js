const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/payment', authMiddleware, paymentController.createPayment);
router.post('/payment/verify', authMiddleware, paymentController.verifyPayment);
router.get('/payments', authMiddleware, paymentController.getPaymentHistory);

module.exports = router;
