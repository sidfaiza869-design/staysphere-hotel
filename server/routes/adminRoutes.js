const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  getAllHotels,
  updateHotelApproval,
  assignHotelManager
} = require('../controllers/adminController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/hotels', getAllHotels);
router.patch('/hotels/:id/approval', updateHotelApproval);
router.post('/hotels/:id/assign-manager', assignHotelManager);

module.exports = router;
