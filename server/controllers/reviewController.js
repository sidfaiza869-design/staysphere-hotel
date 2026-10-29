const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

/**
 * Create a review for an eligible completed stay
 * POST /api/reviews
 */
async function createReview(req, res, next) {
  try {
    const { bookingId, rating, title, comment } = req.body;

    // Verify booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Verify booking belongs to guest
    if (booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review bookings made by your account.'
      });
    }

    // Check stay completion eligibility:
    // Either status is checked_out OR checkOutDate is in the past and bookingStatus is confirmed
    const now = new Date();
    const isPast = new Date(booking.checkOutDate) <= now;
    const isCompleted = booking.bookingStatus === 'checked_out' || (booking.bookingStatus === 'confirmed' && isPast);

    if (!isCompleted || booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after your stay has been completed.'
      });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this stay.'
      });
    }

    const review = await Review.create({
      guest: req.user._id,
      guestName: req.user.name,
      hotel: booking.hotel,
      booking: booking._id,
      rating: parseInt(rating, 10),
      title: title || '',
      comment,
      isVerifiedStay: true,
      moderationStatus: 'approved'
    });

    // Mark booking as reviewed
    booking.hasReviewed = true;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been posted.',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get reviews for a specific hotel
 * GET /api/reviews/hotel/:hotelId
 */
async function getHotelReviews(req, res, next) {
  try {
    const { hotelId } = req.params;
    const reviews = await Review.find({ hotel: hotelId, moderationStatus: 'approved' })
      .sort({ createdAt: -1 })
      .populate('guest', 'name avatar');

    res.status(200).json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Moderate a review (approve/reject)
 * PATCH /api/reviews/:id/moderate
 */
async function moderateReview(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid moderation status.' });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { moderationStatus: status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Recalculate hotel ratings
    await Review.recalculateHotelRating(review.hotel);

    res.status(200).json({
      success: true,
      message: `Review has been ${status}.`,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReview,
  getHotelReviews,
  moderateReview
};
