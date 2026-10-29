const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking
} = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validators');

router.post('/', authenticate, validateBooking, createBooking);
router.get('/my-bookings', authenticate, getUserBookings);
router.get('/:identifier', authenticate, getBookingDetails);
router.post('/:id/cancel', authenticate, cancelBooking);

module.exports = router;
