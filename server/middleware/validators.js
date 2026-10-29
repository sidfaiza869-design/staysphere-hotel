const { body, validationResult } = require('express-validator');

// Validation error checker middleware
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((e) => ({
      field: e.path,
      message: e.msg
    }));
    return res.status(400).json({
      success: false,
      message: errorList[0]?.message || 'Validation failed',
      errors: errorList
    });
  }
  next();
}

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(?:\+91|91)?[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('termsAccepted')
    .custom((val) => {
      if (val !== true && val !== 'true') {
        throw new Error('You must accept the Terms and Conditions');
      }
      return true;
    }),
  handleValidation
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidation
];

const validateBooking = [
  body('hotelId').notEmpty().withMessage('Hotel ID is required').isMongoId().withMessage('Invalid Hotel ID format'),
  body('roomTypeId').notEmpty().withMessage('Room Type ID is required').isMongoId().withMessage('Invalid Room Type ID format'),
  body('checkInDate')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  body('checkOutDate')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Check-out date must be a valid date'),
  body('numberOfRooms')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of rooms must be between 1 and 10'),
  body('guestDetails.fullName')
    .trim()
    .notEmpty()
    .withMessage('Primary guest full name is required'),
  body('guestDetails.email')
    .trim()
    .isEmail()
    .withMessage('Valid primary guest email is required'),
  body('guestDetails.phone')
    .trim()
    .matches(/^(?:\+91|91)?[6-9]\d{9}$/)
    .withMessage('Valid 10-digit Indian phone number is required'),
  handleValidation
];

const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5 stars'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review comment must be between 10 and 1,000 characters'),
  handleValidation
];

module.exports = {
  validateRegister,
  validateLogin,
  validateBooking,
  validateReview,
  handleValidation
};
