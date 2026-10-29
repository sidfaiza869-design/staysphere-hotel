const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      maxlength: [120, 'Hotel name cannot exceed 120 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    tagline: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Hotel description is required'],
      trim: true
    },
    starCategory: {
      type: Number,
      required: [true, 'Star category is required'],
      min: [1, 'Minimum star category is 1'],
      max: [5, 'Maximum star category is 5'],
      default: 3
    },
    hotelType: {
      type: String,
      enum: ['budget', 'standard', 'luxury', 'family', 'business', 'boutique', 'resort', 'heritage'],
      default: 'standard'
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pinCode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true,
      match: [/^\d{6}$/, 'PIN code must be exactly 6 digits']
    },
    coordinates: {
      lat: { type: Number, default: 22.7196 },
      lng: { type: Number, default: 75.8577 }
    },
    images: {
      type: [String],
      default: []
    },
    featuredImage: {
      type: String,
      default: ''
    },
    amenities: {
      type: [String],
      default: []
    },
    policies: {
      checkInTime: { type: String, default: '14:00' },
      checkOutTime: { type: String, default: '11:00' },
      cancellationPolicy: {
        type: String,
        default: 'Free cancellation up to 24 hours prior to check-in. Non-refundable after.'
      },
      houseRules: {
        type: [String],
        default: [
          'Valid government ID required at check-in (Aadhaar, Passport, or Driving License)',
          'Primary guest must be at least 18 years of age',
          'Pets are subject to property discretion'
        ]
      }
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210'
    },
    contactEmail: {
      type: String,
      default: 'reservations@staysphere.com'
    },
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    startingPricePaise: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Slug generator before saving
hotelSchema.pre('save', function (next) {
  if (!this.isModified('name') && this.slug) return next();
  const baseSlug = `${this.name}-${this.city}`
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  this.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  next();
});

hotelSchema.index({ city: 1, isActive: 1, approvalStatus: 1 });
hotelSchema.index({ hotelType: 1, starCategory: 1, averageRating: -1 });

module.exports = mongoose.model('Hotel', hotelSchema);
