const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Room type name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    capacity: {
      adults: { type: Number, default: 2, min: 1 },
      children: { type: Number, default: 1, min: 0 },
      maxGuests: { type: Number, default: 3, min: 1 }
    },
    bedConfiguration: {
      type: String,
      default: '1 King Bed'
    },
    roomSizeSqFt: {
      type: Number,
      default: 280
    },
    totalInventory: {
      type: Number,
      required: [true, 'Total inventory is required'],
      min: [1, 'Must have at least 1 room in inventory'],
      default: 5
    },
    pricePerNightPaise: {
      type: Number,
      required: [true, 'Price per night in paise is required'],
      min: [10000, 'Price must be at least ₹100 (10000 paise)']
    },
    amenities: {
      type: [String],
      default: [
        'Air Conditioning',
        'High-Speed Wi-Fi',
        'Smart Flat TV',
        'Attached Bathroom & Geyser',
        'Electric Kettle & Tea Kit',
        'Work Desk & Chair'
      ]
    },
    images: {
      type: [String],
      default: []
    },
    breakfastIncluded: {
      type: Boolean,
      default: false
    },
    freeCancellation: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

roomTypeSchema.index({ hotel: 1, isActive: 1 });

module.exports = mongoose.model('RoomType', roomTypeSchema);
