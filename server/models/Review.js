const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    guestName: {
      type: String,
      required: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5']
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [10, 'Review comment must be at least 10 characters']
    },
    isVerifiedStay: {
      type: Boolean,
      default: true
    },
    isDemo: {
      type: Boolean,
      default: false
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved'
    }
  },
  {
    timestamps: true
  }
);

// Helper to recalculate hotel average rating and review count
reviewSchema.statics.recalculateHotelRating = async function (hotelId) {
  const Hotel = mongoose.model('Hotel');
  const stats = await this.aggregate([
    {
      $match: {
        hotel: new mongoose.Types.ObjectId(hotelId),
        moderationStatus: 'approved'
      }
    },
    {
      $group: {
        _id: '$hotel',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Hotel.findByIdAndUpdate(hotelId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.recalculateHotelRating(this.hotel);
});

reviewSchema.post('remove', async function () {
  await this.constructor.recalculateHotelRating(this.hotel);
});

module.exports = mongoose.model('Review', reviewSchema);
