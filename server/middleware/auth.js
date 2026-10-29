const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

/**
 * Protect routes: Authenticate via HTTP-only cookie or Authorization header
 */
async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // 2. Check Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.'
      });
    }

    const secret = process.env.JWT_SECRET || 'staysphere_dev_jwt_secret_key_2026';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account for this session no longer exists.'
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact customer support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication: Attaches user if token present, but doesn't block if not
 */
async function optionalAuthenticate(req, res, next) {
  try {
    let token = null;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const secret = process.env.JWT_SECRET || 'staysphere_dev_jwt_secret_key_2026';
      try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);
        if (user && user.accountStatus !== 'suspended') {
          req.user = user;
        }
      } catch (e) {
        // Ignore invalid token in optional auth
      }
    }
    next();
  } catch (err) {
    next();
  }
}

/**
 * Role-based authorization
 * @param {...string} roles Allowed roles: 'guest', 'manager', 'admin'
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
}

/**
 * Verify hotel manager is authorized for specific hotel
 */
async function authorizeHotelManager(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Admins have global access
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Only hotel managers or administrators can perform this action.'
      });
    }

    const hotelId = req.params.hotelId || req.body.hotelId || req.body.hotel;
    if (!hotelId) {
      return next(); // Let downstream controller validate hotelId if needed
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    const isAssigned = hotel.managers.some(
      (mgrId) => mgrId.toString() === req.user._id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage this hotel property.'
      });
    }

    req.hotel = hotel;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorizeRoles,
  authorizeHotelManager
};
