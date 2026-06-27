const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.post('/book', authMiddleware, requireRole('student'), bookingController.createBooking);
router.get('/bookings', authMiddleware, bookingController.getBookings);
router.put('/bookings/:id', authMiddleware, bookingController.updateBookingStatus);
router.get('/stats', authMiddleware, requireRole('admin'), bookingController.getStats);

module.exports = router;
