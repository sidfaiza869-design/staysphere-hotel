const Booking = require('../models/Booking');
const RoomType = require('../models/RoomType');

/**
 * Check room availability for a specific room type between checkIn and checkOut
 * Overlapping booking rule:
 * Existing booking overlaps requested dates if:
 * existing.checkInDate < requestedCheckOutDate && existing.checkOutDate > requestedCheckInDate
 * 
 * @param {string} roomTypeId 
 * @param {Date|string} checkIn 
 * @param {Date|string} checkOut 
 * @param {number} requestedRooms
 */
async function checkRoomAvailability(roomTypeId, checkIn, checkOut, requestedRooms = 1) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Validate dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new Error('Invalid check-in or check-out date');
  }

  if (checkInDate < today) {
    throw new Error('Check-in date cannot be in the past');
  }

  if (checkInDate >= checkOutDate) {
    throw new Error('Check-out date must be strictly after check-in date');
  }

  const roomType = await RoomType.findById(roomTypeId);
  if (!roomType || !roomType.isActive) {
    throw new Error('Room type not found or is currently inactive');
  }

  // Count occupied rooms in overlapping confirmed / checked_in bookings
  const overlappingBookings = await Booking.find({
    roomType: roomTypeId,
    bookingStatus: { $in: ['confirmed', 'checked_in'] },
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate }
  }).select('numberOfRooms');

  const occupiedRooms = overlappingBookings.reduce((sum, b) => sum + (b.numberOfRooms || 1), 0);
  const availableRooms = Math.max(0, roomType.totalInventory - occupiedRooms);
  const isAvailable = availableRooms >= requestedRooms;

  return {
    roomTypeId: roomType._id,
    roomTypeName: roomType.name,
    totalInventory: roomType.totalInventory,
    occupiedRooms,
    availableRooms,
    requestedRooms,
    isAvailable,
    pricePerNightPaise: roomType.pricePerNightPaise
  };
}

/**
 * Check availability for all active room types of a hotel
 */
async function getHotelRoomAvailability(hotelId, checkIn, checkOut) {
  const roomTypes = await RoomType.find({ hotel: hotelId, isActive: true });
  
  if (!checkIn || !checkOut) {
    return roomTypes.map((rt) => ({
      ...rt.toObject(),
      availableRooms: rt.totalInventory,
      isAvailable: rt.totalInventory > 0
    }));
  }

  const results = await Promise.all(
    roomTypes.map(async (rt) => {
      try {
        const avail = await checkRoomAvailability(rt._id, checkIn, checkOut, 1);
        return {
          ...rt.toObject(),
          availableRooms: avail.availableRooms,
          isAvailable: avail.isAvailable
        };
      } catch (err) {
        return {
          ...rt.toObject(),
          availableRooms: 0,
          isAvailable: false,
          error: err.message
        };
      }
    })
  );

  return results;
}

module.exports = {
  checkRoomAvailability,
  getHotelRoomAvailability
};
