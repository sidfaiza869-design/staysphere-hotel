const crypto = require('crypto');
const Payment = require('../models/Payment');

/**
 * StaySphere Payment Service
 * Secure payment handling with verified demo simulation & optional Razorpay test-mode
 */
class PaymentService {
  /**
   * Process a simulated demo payment
   */
  static async processDemoPayment({
    bookingId,
    bookingReference,
    amountPaise,
    paymentMethod = 'UPI / NetBanking (Demo Simulated)'
  }) {
    const randomTxnId = `DEMO_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payment = await Payment.create({
      booking: bookingId,
      bookingReference,
      amountPaise,
      currency: 'INR',
      paymentProvider: 'demo',
      providerOrderId: `DEMO_ORD_${Date.now()}`,
      providerPaymentId: randomTxnId,
      paymentStatus: 'success',
      paymentMethod,
      isSimulated: true,
      paidAt: new Date()
    });

    return payment;
  }

  /**
   * Create Razorpay order if RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET are configured
   */
  static async createRazorpayOrder({ bookingReference, amountPaise }) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured. Please use Demo payment mode.');
    }

    // Razorpay Node SDK or direct REST call
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: bookingReference,
        notes: {
          platform: 'StaySphere',
          bookingReference
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.description || 'Failed to create Razorpay order');
    }

    const orderData = await response.json();
    return orderData;
  }

  /**
   * Verify Razorpay signature
   */
  static verifyRazorpaySignature({ orderId, paymentId, signature }) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error('Razorpay key secret not configured');
    }

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    return generatedSignature === signature;
  }
}

module.exports = PaymentService;
