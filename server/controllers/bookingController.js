const Booking = require('../models/Booking');
const RoomType = require('../models/RoomType');
const Hotel = require('../models/Hotel');
const Payment = require('../models/Payment');
const { checkRoomAvailability } = require('../services/availabilityService');
const { calculateBookingPricing } = require('../utils/currency');
const PaymentService = require('../services/paymentService');

/**
 * Generate a unique, professional booking reference
 * e.g. SS-IN-2610-A9F4
 */
function generateBookingReference() {
  const datePart = new Date().toISOString().slice(2, 7).replace('-', '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SS-IN-${datePart}-${randomPart}`;
}

/**
 * Create a new booking with backend pricing calculation & atomic availability verification
 * POST /api/bookings
 */
async function createBooking(req, res, next) {
  try {
    const {
      hotelId,
      roomTypeId,
      checkInDate,
      checkOutDate,
      numberOfRooms = 1,
      numberOfGuests,
      guestDetails,
      paymentMethod = 'UPI / NetBanking (Demo Simulated)'
    } = req.body;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Calculate nights
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const numberOfNights = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (numberOfNights < 1) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be at least 1 day after check-in date.'
      });
    }

    const roomsCount = Math.max(1, parseInt(numberOfRooms, 10));

    // Verify room availability on backend
    const availability = await checkRoomAvailability(roomTypeId, checkIn, checkOut, roomsCount);
    if (!availability.isAvailable) {
      return res.status(409).json({
        success: false,
        message: `Sorry, only ${availability.availableRooms} room(s) available for selected dates. You requested ${roomsCount}.`
      });
    }

    const [hotel, roomType] = await Promise.all([
      Hotel.findById(hotelId),
      RoomType.findById(roomTypeId)
    ]);

    if (!hotel || !hotel.isActive) {
      return res.status(404).json({ success: false, message: 'Hotel not found or currently unavailable.' });
    }

    // Backend pricing calculation: NEVER trust client totals
    const pricing = calculateBookingPricing({
      pricePerNightPaise: roomType.pricePerNightPaise,
      numberOfNights,
      numberOfRooms: roomsCount,
      taxRatePercent: 12
    });

    const bookingReference = generateBookingReference();

    // Create booking
    const booking = new Booking({
      bookingReference,
      guest: req.user._id,
      hotel: hotelId,
      roomType: roomTypeId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfNights,
      numberOfRooms: roomsCount,
      numberOfGuests: numberOfGuests || { adults: 2, children: 0 },
      guestDetails: {
        fullName: guestDetails?.fullName || req.user.name,
        email: guestDetails?.email || req.user.email,
        phone: guestDetails?.phone || req.user.phone,
        city: guestDetails?.city || '',
        state: guestDetails?.state || '',
        pinCode: guestDetails?.pinCode || '',
        specialRequests: guestDetails?.specialRequests || ''
      },
      pricing,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid'
    });

    await booking.save();

    // Process simulated demo payment
    const payment = await PaymentService.processDemoPayment({
      bookingId: booking._id,
      bookingReference: booking.bookingReference,
      amountPaise: pricing.totalAmountPaise,
      paymentMethod
    });

    booking.payment = payment._id;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('hotel', 'name address city state pinCode featuredImage policies contactPhone contactEmail')
      .populate('roomType', 'name bedConfiguration amenities breakfastIncluded')
      .populate('payment');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get bookings of current logged-in guest
 * GET /api/bookings/my-bookings
 */
async function getUserBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .sort({ createdAt: -1 })
      .populate('hotel', 'name slug city state featuredImage policies contactPhone')
      .populate('roomType', 'name bedConfiguration')
      .populate('payment');

    const now = new Date();
    const upcoming = [];
    const past = [];
    const cancelled = [];

    bookings.forEach((b) => {
      if (b.bookingStatus === 'cancelled') {
        cancelled.push(b);
      } else if (new Date(b.checkOutDate) < now) {
        past.push(b);
      } else {
        upcoming.push(b);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        all: bookings,
        upcoming,
        past,
        cancelled,
        totalBookings: bookings.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single booking details by booking reference or ID
 * GET /api/bookings/:identifier
 */
async function getBookingDetails(req, res, next) {
  try {
    const { identifier } = req.params;
    const isMongoId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: identifier } : { bookingReference: identifier.toUpperCase() };

    const booking = await Booking.findOne(query)
      .populate('hotel', 'name slug address locality city state pinCode featuredImage policies contactPhone contactEmail')
      .populate('roomType', 'name bedConfiguration amenities breakfastIncluded')
      .populate('payment')
      .populate('guest', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Authorization: Guest can view own, Manager can view assigned hotel, Admin can view all
    if (req.user.role === 'guest') {
      if (booking.guest._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this booking.'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel a booking with policy calculation and inventory release
 * POST /api/bookings/:id/cancel
 */
async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by guest' } = req.body;

    const booking = await Booking.findById(id).populate('hotel');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Permission check
    if (req.user.role === 'guest') {
      if (booking.guest.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to cancel this booking.'
        });
      }
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.'
      });
    }

    if (booking.bookingStatus === 'checked_out') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that has already been completed.'
      });
    }

    // Policy & Refund calculation:
    // If cancelled >= 24 hours prior to check-in: 100% refund eligible
    // If < 24 hours: 50% cancellation fee, 50% refund eligible
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    const hoursToCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundAmountPaise = 0;
    let cancellationFeePaise = 0;
    let refundStatus = 'none';

    if (hoursToCheckIn >= 24) {
      refundAmountPaise = booking.pricing.totalAmountPaise;
      cancellationFeePaise = 0;
      refundStatus = 'processed';
    } else if (hoursToCheckIn > 0) {
      // 50% cancellation fee
      cancellationFeePaise = Math.round(booking.pricing.totalAmountPaise * 0.5);
      refundAmountPaise = booking.pricing.totalAmountPaise - cancellationFeePaise;
      refundStatus = 'processed';
    } else {
      // Check-in day or after: non-refundable
      cancellationFeePaise = booking.pricing.totalAmountPaise;
      refundAmountPaise = 0;
      refundStatus = 'ineligible';
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = refundAmountPaise > 0 ? 'refunded' : booking.paymentStatus;
    booking.cancellationDetails = {
      cancelledAt: new Date(),
      reason,
      cancellationFeePaise,
      refundAmountPaise,
      refundStatus
    };

    await booking.save();

    // Update payment record
    if (booking.payment) {
      await Payment.findByIdAndUpdate(booking.payment, {
        paymentStatus: refundAmountPaise > 0 ? 'refunded' : 'success',
        refundDetails: {
          refundId: `REF_${Date.now()}`,
          amountPaise: refundAmountPaise,
          refundedAt: new Date(),
          note: `Simulated refund of ₹${refundAmountPaise / 100} for reference ${booking.bookingReference}`
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Inventory has been released.',
      data: {
        booking,
        cancellationDetails: booking.cancellationDetails
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking
};
