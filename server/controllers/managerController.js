const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Booking = require('../models/Booking');

/**
 * Get manager's assigned hotel IDs
 */
async function getManagerHotelIds(user) {
  if (user.role === 'admin') {
    const all = await Hotel.find().select('_id');
    return all.map((h) => h._id);
  }
  const hotels = await Hotel.find({ managers: user._id }).select('_id');
  return hotels.map((h) => h._id);
}

/**
 * Hotel Manager Dashboard Overview Statistics
 * GET /api/manager/stats
 */
async function getManagerStats(req, res, next) {
  try {
    const hotelIds = await getManagerHotelIds(req.user);

    if (hotelIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalProperties: 0,
          totalRooms: 0,
          todaysArrivals: 0,
          todaysDepartures: 0,
          activeReservations: 0,
          occupancyRate: 0,
          totalRevenuePaise: 0,
          recentBookings: []
        }
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalProperties,
      roomTypes,
      todaysArrivals,
      todaysDepartures,
      activeReservations,
      revenueResult,
      recentBookings
    ] = await Promise.all([
      Hotel.countDocuments({ _id: { $in: hotelIds } }),
      RoomType.find({ hotel: { $in: hotelIds }, isActive: true }).select('totalInventory'),
      Booking.countDocuments({
        hotel: { $in: hotelIds },
        checkInDate: { $gte: todayStart, $lte: todayEnd },
        bookingStatus: { $in: ['confirmed', 'checked_in'] }
      }),
      Booking.countDocuments({
        hotel: { $in: hotelIds },
        checkOutDate: { $gte: todayStart, $lte: todayEnd },
        bookingStatus: { $in: ['confirmed', 'checked_in'] }
      }),
      Booking.countDocuments({
        hotel: { $in: hotelIds },
        bookingStatus: { $in: ['confirmed', 'checked_in'] }
      }),
      Booking.aggregate([
        {
          $match: {
            hotel: { $in: hotelIds },
            bookingStatus: { $in: ['confirmed', 'checked_in', 'checked_out'] },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.totalAmountPaise' }
          }
        }
      ]),
      Booking.find({ hotel: { $in: hotelIds } })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('hotel', 'name city')
        .populate('roomType', 'name')
        .populate('guest', 'name email phone')
    ]);

    const totalRooms = roomTypes.reduce((sum, r) => sum + (r.totalInventory || 0), 0);
    const occupancyRate = totalRooms > 0 ? Math.min(100, Math.round((activeReservations / totalRooms) * 100)) : 0;
    const totalRevenuePaise = revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        totalRooms,
        todaysArrivals,
        todaysDepartures,
        activeReservations,
        occupancyRate,
        totalRevenuePaise,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get managed properties for this manager
 * GET /api/manager/properties
 */
async function getManagedProperties(req, res, next) {
  try {
    const hotelIds = await getManagerHotelIds(req.user);
    const hotels = await Hotel.find({ _id: { $in: hotelIds } })
      .sort({ createdAt: -1 })
      .populate('managers', 'name email');

    res.status(200).json({
      success: true,
      data: { hotels }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get managed reservations with filtering and search
 * GET /api/manager/reservations
 */
async function getManagedReservations(req, res, next) {
  try {
    const hotelIds = await getManagerHotelIds(req.user);
    const { status, search, hotelId } = req.query;

    const filter = {
      hotel: { $in: hotelIds }
    };

    if (hotelId) {
      filter.hotel = hotelId;
    }

    if (status && status !== 'all') {
      filter.bookingStatus = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { bookingReference: regex },
        { 'guestDetails.fullName': regex },
        { 'guestDetails.email': regex },
        { 'guestDetails.phone': regex }
      ];
    }

    const reservations = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('hotel', 'name city')
      .populate('roomType', 'name bedConfiguration')
      .populate('payment')
      .populate('guest', 'name email phone');

    res.status(200).json({
      success: true,
      data: { reservations }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update reservation status (check in, check out, cancel)
 * PATCH /api/manager/reservations/:id/status
 */
async function updateReservationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'checked_in', 'checked_out', 'cancelled'

    if (!['checked_in', 'checked_out', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status update.' });
    }

    const booking = await Booking.findById(id).populate('hotel');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Authorization
    if (req.user.role !== 'admin') {
      const isManager = booking.hotel.managers.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isManager) {
        return res.status(403).json({ success: false, message: 'Not authorized for this property.' });
      }
    }

    booking.bookingStatus = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Reservation marked as ${status.replace('_', ' ')}.`,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getManagerStats,
  getManagedProperties,
  getManagedReservations,
  updateReservationStatus
};
