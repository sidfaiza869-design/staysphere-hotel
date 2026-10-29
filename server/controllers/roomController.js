const RoomType = require('../models/RoomType');
const Hotel = require('../models/Hotel');

/**
 * Get all room types for a hotel
 * GET /api/rooms/hotel/:hotelId
 */
async function getRoomsByHotel(req, res, next) {
  try {
    const { hotelId } = req.params;
    const roomTypes = await RoomType.find({ hotel: hotelId }).sort({ pricePerNightPaise: 1 });
    res.status(200).json({
      success: true,
      data: { roomTypes }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a room type (Manager or Admin)
 * POST /api/rooms
 */
async function createRoom(req, res, next) {
  try {
    const {
      hotelId,
      name,
      description,
      capacity,
      bedConfiguration,
      roomSizeSqFt,
      totalInventory,
      pricePerNightPaise,
      amenities,
      images,
      breakfastIncluded,
      freeCancellation
    } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    // Authorization
    if (req.user.role !== 'admin') {
      const isManager = hotel.managers.some((m) => m.toString() === req.user._id.toString());
      if (!isManager) {
        return res.status(403).json({ success: false, message: 'Not authorized for this hotel.' });
      }
    }

    const roomType = await RoomType.create({
      hotel: hotelId,
      name,
      description,
      capacity: capacity || { adults: 2, children: 1, maxGuests: 3 },
      bedConfiguration: bedConfiguration || '1 King Bed',
      roomSizeSqFt: roomSizeSqFt || 280,
      totalInventory: parseInt(totalInventory, 10) || 5,
      pricePerNightPaise: parseInt(pricePerNightPaise, 10),
      amenities: amenities || [],
      images: images || [],
      breakfastIncluded: Boolean(breakfastIncluded),
      freeCancellation: freeCancellation !== undefined ? Boolean(freeCancellation) : true,
      isActive: true
    });

    // Update hotel starting price if this is lower or startingPrice is 0
    if (!hotel.startingPricePaise || roomType.pricePerNightPaise < hotel.startingPricePaise) {
      hotel.startingPricePaise = roomType.pricePerNightPaise;
      await hotel.save();
    }

    res.status(201).json({
      success: true,
      message: 'Room type added successfully.',
      data: { roomType }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update room type
 * PUT /api/rooms/:id
 */
async function updateRoom(req, res, next) {
  try {
    const { id } = req.params;
    const roomType = await RoomType.findById(id).populate('hotel');
    if (!roomType) {
      return res.status(404).json({ success: false, message: 'Room type not found.' });
    }

    if (req.user.role !== 'admin') {
      const isManager = roomType.hotel.managers.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isManager) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this room.' });
      }
    }

    const updated = await RoomType.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Room type updated successfully.',
      data: { roomType: updated }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle room active state
 * DELETE /api/rooms/:id
 */
async function deleteRoom(req, res, next) {
  try {
    const { id } = req.params;
    const roomType = await RoomType.findById(id).populate('hotel');
    if (!roomType) {
      return res.status(404).json({ success: false, message: 'Room type not found.' });
    }

    if (req.user.role !== 'admin') {
      const isManager = roomType.hotel.managers.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isManager) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
    }

    roomType.isActive = !roomType.isActive;
    await roomType.save();

    res.status(200).json({
      success: true,
      message: `Room type has been ${roomType.isActive ? 'activated' : 'deactivated'}.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRoomsByHotel,
  createRoom,
  updateRoom,
  deleteRoom
};
