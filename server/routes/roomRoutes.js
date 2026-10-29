const express = require('express');
const router = express.Router();
const {
  getRoomsByHotel,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/hotel/:hotelId', getRoomsByHotel);

// Manager & Admin routes
router.post('/', authenticate, authorizeRoles('manager', 'admin'), createRoom);
router.put('/:id', authenticate, authorizeRoles('manager', 'admin'), updateRoom);
router.delete('/:id', authenticate, authorizeRoles('manager', 'admin'), deleteRoom);

module.exports = router;
