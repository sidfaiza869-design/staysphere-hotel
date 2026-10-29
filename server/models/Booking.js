const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Guest reference is required'],
      index: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required'],
      index: true
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Room type reference is required'],
      index: true
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
      index: true
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
      index: true
    },
    numberOfNights: {
      type: Number,
      required: true,
      min: 1
    },
    numberOfRooms: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    numberOfGuests: {
      adults: { type: Number, default: 2, min: 1 },
      children: { type: Number, default: 0, min: 0 }
    },
    guestDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pinCode: { type: String, default: '' },
      specialRequests: { type: String, default: '' }
    },
    pricing: {
      roomRatePaise: { type: Number, required: true },
      numberOfNights: { type: Number, required: true },
      numberOfRooms: { type: Number, required: true },
      baseAmountPaise: { type: Number, required: true },
      discountPercent: { type: Number, default: 0 },
      discountAmountPaise: { type: Number, default: 0 },
      taxableAmountPaise: { type: Number, required: true },
      taxRatePercent: { type: Number, default: 12 },
      taxAmountPaise: { type: Number, required: true },
      totalAmountPaise: { type: Number, required: true },
      currency: { type: String, default: 'INR' }
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
      default: 'confirmed',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
      index: true
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    cancellationDetails: {
      cancelledAt: { type: Date },
      reason: { type: String, default: '' },
      cancellationFeePaise: { type: Number, default: 0 },
      refundAmountPaise: { type: Number, default: 0 },
      refundStatus: {
        type: String,
        enum: ['none', 'pending', 'processed', 'ineligible'],
        default: 'none'
      }
    },
    hasReviewed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ hotel: 1, checkInDate: 1, checkOutDate: 1, bookingStatus: 1 });
bookingSchema.index({ guest: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
