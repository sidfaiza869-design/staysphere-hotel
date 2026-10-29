const express = require('express');
const router = express.Router();
const {
  checkAvailability,
  getHotelAvailability
} = require('../controllers/availabilityController');

router.get('/check', checkAvailability);
router.get('/hotel/:hotelId', getHotelAvailability);

module.exports = router;
