const {
  checkRoomAvailability,
  getHotelRoomAvailability
} = require('../services/availabilityService');

/**
 * Check single room type availability
 * GET /api/availability/check
 */
async function checkAvailability(req, res, next) {
  try {
    const { roomTypeId, checkIn, checkOut, rooms = 1 } = req.query;

    if (!roomTypeId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'roomTypeId, checkIn, and checkOut are required parameters'
      });
    }

    const requestedRooms = parseInt(rooms, 10) || 1;
    const result = await checkRoomAvailability(roomTypeId, checkIn, checkOut, requestedRooms);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get hotel-wide availability across all room types
 * GET /api/availability/hotel/:hotelId
 */
async function getHotelAvailability(req, res, next) {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut } = req.query;

    const roomTypes = await getHotelRoomAvailability(hotelId, checkIn, checkOut);

    res.status(200).json({
      success: true,
      data: { roomTypes }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkAvailability,
  getHotelAvailability
};
