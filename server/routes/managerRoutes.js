const express = require('express');
const router = express.Router();
const {
  getManagerStats,
  getManagedProperties,
  getManagedReservations,
  updateReservationStatus
} = require('../controllers/managerController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);
router.use(authorizeRoles('manager', 'admin'));

router.get('/stats', getManagerStats);
router.get('/properties', getManagedProperties);
router.get('/reservations', getManagedReservations);
router.patch('/reservations/:id/status', updateReservationStatus);

module.exports = router;
