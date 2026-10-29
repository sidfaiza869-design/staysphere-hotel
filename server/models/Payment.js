const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    bookingReference: {
      type: String,
      required: true,
      index: true
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentProvider: {
      type: String,
      enum: ['demo', 'razorpay'],
      default: 'demo'
    },
    providerOrderId: {
      type: String,
      default: ''
    },
    providerPaymentId: {
      type: String,
      default: ''
    },
    providerSignature: {
      type: String,
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'success',
      index: true
    },
    paymentMethod: {
      type: String,
      default: 'UPI / NetBanking (Demo Simulated)'
    },
    isSimulated: {
      type: Boolean,
      default: true
    },
    paidAt: {
      type: Date,
      default: Date.now
    },
    refundDetails: {
      refundId: { type: String, default: '' },
      amountPaise: { type: Number, default: 0 },
      refundedAt: { type: Date },
      note: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
