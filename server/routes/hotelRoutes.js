const express = require('express');
const router = express.Router();
const {
  getHotels,
  getFeaturedHotels,
  getDestinations,
  getHotelDetails,
  createHotel,
  updateHotel,
  toggleHotelStatus
} = require('../controllers/hotelController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);
router.get('/destinations', getDestinations);
router.get('/:identifier', getHotelDetails);

// Manager & Admin routes
router.post('/', authenticate, authorizeRoles('manager', 'admin'), createHotel);
router.put('/:id', authenticate, authorizeRoles('manager', 'admin'), updateHotel);
router.patch('/:id/status', authenticate, authorizeRoles('manager', 'admin'), toggleHotelStatus);

module.exports = router;
