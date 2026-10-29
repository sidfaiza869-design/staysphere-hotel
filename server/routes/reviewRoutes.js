const express = require('express');
const router = express.Router();
const {
  createReview,
  getHotelReviews,
  moderateReview
} = require('../controllers/reviewController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { validateReview } = require('../middleware/validators');

router.get('/hotel/:hotelId', getHotelReviews);
router.post('/', authenticate, validateReview, createReview);
router.patch('/:id/moderate', authenticate, authorizeRoles('admin'), moderateReview);

module.exports = router;
