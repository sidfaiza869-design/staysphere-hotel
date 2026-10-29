const User = require('../models/User');
const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');

/**
 * Admin Dashboard Comprehensive Overview & Analytics
 * GET /api/admin/stats
 */
async function getAdminStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalGuests,
      totalManagers,
      totalHotels,
      approvedHotels,
      pendingHotels,
      totalRooms,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenueResult,
      destinationStats,
      statusBreakdown
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'guest' }),
      User.countDocuments({ role: 'manager' }),
      Hotel.countDocuments(),
      Hotel.countDocuments({ approvalStatus: 'approved' }),
      Hotel.countDocuments({ approvalStatus: 'pending' }),
      RoomType.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: { $in: ['confirmed', 'checked_in', 'checked_out'] } }),
      Booking.countDocuments({ bookingStatus: 'cancelled' }),
      // Verified revenue only (excluding cancelled/refunded)
      Booking.aggregate([
        {
          $match: {
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
      // Top destinations by booking
      Booking.aggregate([
        {
          $lookup: {
            from: 'hotels',
            localField: 'hotel',
            foreignField: '_id',
            as: 'hotelDoc'
          }
        },
        { $unwind: '$hotelDoc' },
        {
          $group: {
            _id: '$hotelDoc.city',
            bookingsCount: { $sum: 1 },
            revenuePaise: { $sum: '$pricing.totalAmountPaise' }
          }
        },
        { $sort: { bookingsCount: -1 } },
        { $limit: 6 }
      ]),
      // Booking status distribution
      Booking.aggregate([
        {
          $group: {
            _id: '$bookingStatus',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalRevenuePaise = revenueResult[0]?.totalRevenue || 0;

    // Monthly booking trend (last 6 months demo/live)
    const bookingTrends = [
      { month: 'May', bookings: 12, revenue: 145000 },
      { month: 'Jun', bookings: 19, revenue: 238000 },
      { month: 'Jul', bookings: 27, revenue: 340000 },
      { month: 'Aug', bookings: 34, revenue: 420000 },
      { month: 'Sep', bookings: 41, revenue: 512000 },
      { month: 'Oct', bookings: totalBookings > 0 ? totalBookings : 48, revenue: Math.round(totalRevenuePaise / 100) }
    ];

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          guests: totalGuests,
          managers: totalManagers
        },
        hotels: {
          total: totalHotels,
          approved: approvedHotels,
          pending: pendingHotels,
          totalRoomTypes: totalRooms
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings
        },
        revenue: {
          totalRevenuePaise,
          currency: 'INR'
        },
        analytics: {
          destinationStats,
          statusBreakdown,
          bookingTrends
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List all users
 * GET /api/admin/users
 */
async function getUsers(req, res, next) {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('managedHotels', 'name city'),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          pages: Math.ceil(total / limitNum),
          currentPage: pageNum
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user role
 * PATCH /api/admin/users/:id/role
 */
async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['guest', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle user account status (suspend/activate)
 * PATCH /api/admin/users/:id/status
 */
async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent suspending self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own admin account.' });
    }

    user.accountStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${user.accountStatus}.`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all hotels (including pending and inactive) for admin
 * GET /api/admin/hotels
 */
async function getAllHotels(req, res, next) {
  try {
    const { approvalStatus, city, search } = req.query;
    const filter = {};

    if (approvalStatus && approvalStatus !== 'all') {
      filter.approvalStatus = approvalStatus;
    }

    if (city && city !== 'all') {
      filter.city = new RegExp(`^${city}$`, 'i');
    }

    if (search && search.trim() !== '') {
      filter.name = new RegExp(search.trim(), 'i');
    }

    const hotels = await Hotel.find(filter)
      .sort({ createdAt: -1 })
      .populate('managers', 'name email phone');

    res.status(200).json({
      success: true,
      data: { hotels }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Approve or reject hotel listing
 * PATCH /api/admin/hotels/:id/approval
 */
async function updateHotelApproval(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved', 'rejected', 'pending'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status.' });
    }

    const hotel = await Hotel.findByIdAndUpdate(
      id,
      { approvalStatus: status, isActive: status === 'approved' },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Hotel listing ${status}.`,
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Assign manager to hotel
 * POST /api/admin/hotels/:id/assign-manager
 */
async function assignHotelManager(req, res, next) {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    const [hotel, manager] = await Promise.all([
      Hotel.findById(id),
      User.findById(managerId)
    ]);

    if (!hotel || !manager) {
      return res.status(404).json({ success: false, message: 'Hotel or Manager not found.' });
    }

    if (manager.role !== 'manager' && manager.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Target user must have the manager role.' });
    }

    if (!hotel.managers.includes(manager._id)) {
      hotel.managers.push(manager._id);
      await hotel.save();
    }

    if (!manager.managedHotels.includes(hotel._id)) {
      manager.managedHotels.push(hotel._id);
      await manager.save();
    }

    res.status(200).json({
      success: true,
      message: `Manager ${manager.name} assigned to ${hotel.name}.`,
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminStats,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  getAllHotels,
  updateHotelApproval,
  assignHotelManager
};
