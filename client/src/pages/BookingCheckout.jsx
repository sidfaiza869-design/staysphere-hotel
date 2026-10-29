import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatINR, formatDate, calculateStayNights } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  RiShieldCheckLine,
  RiCheckDoubleLine,
  RiHotelLine,
  RiCalendarLine,
  RiUserLine,
  RiMapPinLine,
  RiInformationLine,
  RiLock2Line
} from 'react-icons/ri';

export default function BookingCheckout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if accessed directly without stay state
  if (!state || !state.hotel || !state.roomType) {
    navigate('/explore');
    return null;
  }

  const { hotel, roomType, checkInDate, checkOutDate, numberOfGuests, numberOfRooms } = state;

  const nights = calculateStayNights(checkInDate, checkOutDate);
  const roomsCount = numberOfRooms || 1;
  const ratePaise = roomType.pricePerNightPaise;
  const baseAmountPaise = ratePaise * nights * roomsCount;
  const taxRatePercent = 12; // Configurable sample GST
  const taxAmountPaise = Math.round((baseAmountPaise * taxRatePercent) / 100);
  const totalAmountPaise = baseAmountPaise + taxAmountPaise;

  // Guest details form state
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'Indore');
  const [guestState, setGuestState] = useState(user?.state || 'Madhya Pradesh');
  const [pinCode, setPinCode] = useState(user?.pinCode || '452010');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI — GooglePay / PhonePe (Simulated Demo)');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    // Validation
    if (!fullName || !email || !phone) {
      toast.error('Please complete all primary guest contact details');
      return;
    }

    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      toast.error('Please provide a valid 10-digit Indian phone number (starting with 6-9)');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please accept the booking terms and hotel policies');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        hotelId: hotel._id,
        roomTypeId: roomType._id,
        checkInDate,
        checkOutDate,
        numberOfRooms: roomsCount,
        numberOfGuests: numberOfGuests || { adults: 2, children: 0 },
        guestDetails: {
          fullName,
          email,
          phone,
          city,
          state: guestState,
          pinCode,
          specialRequests
        },
        paymentMethod
      };

      const res = await api.post('/bookings', payload);
      if (res.success && res.data?.booking) {
        toast.success('Reservation confirmed successfully!');
        navigate('/booking-confirmation', {
          state: { booking: res.data.booking }
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-4">
      <div className="container">
        {/* Page Header */}
        <div className="mb-4">
          <span className="badge-demo text-uppercase mb-1">Step 4 of 4 — Final Reservation</span>
          <h1 className="fw-bold mb-1">Confirm Your Stay & Guest Details</h1>
          <p className="text-muted mb-0">
            Review reservation details, guest verification, and complete the simulated demo payment.
          </p>
        </div>

        <div className="row g-4">
          {/* Left Form Column */}
          <div className="col-lg-7">
            <form onSubmit={handleSubmitBooking}>
              {/* Primary Guest Details */}
              <div className="bg-white p-4 border rounded-3 shadow-sm mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span
                    className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '28px', height: '28px', backgroundColor: '#0d9488', fontSize: '0.85rem' }}
                  >
                    1
                  </span>
                  <h4 className="fw-bold mb-0">Primary Guest Contact</h4>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Full Legal Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rohan Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    <div className="form-text small" style={{ fontSize: '0.72rem' }}>
                      Must match government ID presented at check-in
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. rohan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <div className="form-text small" style={{ fontSize: '0.72rem' }}>
                      Booking confirmation and invoice receipt will be sent here
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Mobile Number (India +91) *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">City & State</label>
                    <div className="row g-2">
                      <div className="col-6">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="State"
                          value={guestState}
                          onChange={(e) => setGuestState(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">PIN Code (6 Digits)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 452010"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Special Requests (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Early check-in request, quiet room, upper floor, etc. Subject to hotel availability."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white p-4 border rounded-3 shadow-sm mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span
                    className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '28px', height: '28px', backgroundColor: '#0d9488', fontSize: '0.85rem' }}
                  >
                    2
                  </span>
                  <h4 className="fw-bold mb-0">Select Payment Method (Demo Simulation)</h4>
                </div>

                <div className="alert alert-warning small d-flex align-items-center gap-2 mb-3">
                  <RiInformationLine size={20} className="flex-shrink-0" />
                  <div>
                    <strong>Demo Environment Active:</strong> No real money will be charged. This demonstrates full booking creation, payment record generation, and inventory allocation safely.
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 mb-3">
                  <label
                    className={`p-3 border rounded-3 d-flex align-items-center justify-content-between cursor-pointer ${
                      paymentMethod.includes('UPI') ? 'border-teal bg-light' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        value="UPI — GooglePay / PhonePe (Simulated Demo)"
                        checked={paymentMethod.includes('UPI')}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-check-input mt-0"
                      />
                      <div>
                        <div className="fw-bold">UPI / Instant VPA (Simulated)</div>
                        <div className="small text-muted">GooglePay, PhonePe, Paytm, BHIM</div>
                      </div>
                    </div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      Recommended
                    </span>
                  </label>

                  <label
                    className={`p-3 border rounded-3 d-flex align-items-center justify-content-between cursor-pointer ${
                      paymentMethod.includes('Debit Card') ? 'border-teal bg-light' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        value="RuPay / Visa / Mastercard Debit Card (Simulated Demo)"
                        checked={paymentMethod.includes('Debit Card')}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-check-input mt-0"
                      />
                      <div>
                        <div className="fw-bold">Credit / Debit Card (Simulated)</div>
                        <div className="small text-muted">RuPay, Visa, Mastercard, Diners</div>
                      </div>
                    </div>
                    <span className="badge bg-light text-secondary border">All Banks</span>
                  </label>

                  <label
                    className={`p-3 border rounded-3 d-flex align-items-center justify-content-between cursor-pointer ${
                      paymentMethod.includes('NetBanking') ? 'border-teal bg-light' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        value="NetBanking — HDFC / SBI / ICICI (Simulated Demo)"
                        checked={paymentMethod.includes('NetBanking')}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-check-input mt-0"
                      />
                      <div>
                        <div className="fw-bold">NetBanking (Simulated)</div>
                        <div className="small text-muted">SBI, HDFC, ICICI, Axis, PNB & 50+ Banks</div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="termsCheck"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label className="form-check-label small text-secondary" htmlFor="termsCheck">
                    I agree to the hotel check-in policies, cancellation terms, and certify that all adult guests will carry valid Indian photo identity proofs.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !agreeTerms}
                  className="btn btn-teal w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: '1.05rem' }}
                >
                  <RiLock2Line size={18} />
                  {isSubmitting ? 'Confirming Reservation...' : `Pay ${formatINR(totalAmountPaise)} (Demo Confirm)`}
                </button>
              </div>
            </form>
          </div>

          {/* Right Summary Column */}
          <div className="col-lg-5">
            <div className="bg-white p-4 border rounded-3 shadow-sm sticky-top" style={{ top: '90px' }}>
              <h5 className="fw-bold mb-3 border-bottom pb-2">Booking Summary</h5>

              {/* Property Card */}
              <div className="d-flex gap-3 mb-3">
                <img
                  src={hotel.featuredImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'}
                  alt={hotel.name}
                  className="rounded-2"
                  style={{ width: '85px', height: '85px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-1 text-truncate" style={{ maxWidth: '240px' }}>
                    {hotel.name}
                  </h6>
                  <div className="small text-muted mb-1">
                    <RiMapPinLine className="text-teal" /> {hotel.locality}, {hotel.city}
                  </div>
                  <span className="badge bg-light text-dark border small">
                    {hotel.starCategory} Star Property
                  </span>
                </div>
              </div>

              {/* Stay Breakdown */}
              <div className="p-3 bg-light rounded-2 border mb-3 small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Selected Room:</span>
                  <span className="fw-bold">{roomType.name}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Check-In:</span>
                  <span className="fw-semibold">{formatDate(checkInDate)} (From 14:00)</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Check-Out:</span>
                  <span className="fw-semibold">{formatDate(checkOutDate)} (Until 11:00)</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Duration:</span>
                  <span className="fw-semibold">{nights} Night(s)</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Quantity:</span>
                  <span className="fw-semibold">{roomsCount} Room(s)</span>
                </div>
              </div>

              {/* Price Calculation (Backend-aligned) */}
              <div className="border-top pt-3 mb-3">
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">
                    {formatINR(ratePaise)} × {nights} night(s) × {roomsCount} room
                  </span>
                  <span>{formatINR(baseAmountPaise)}</span>
                </div>

                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Applicable Discount (0%)</span>
                  <span className="text-success">₹0</span>
                </div>

                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Sample GST (12% CGST + SGST)</span>
                  <span>{formatINR(taxAmountPaise)}</span>
                </div>

                <div className="d-flex justify-content-between fw-bold pt-2 border-top fs-5">
                  <span>Total Amount (INR)</span>
                  <span style={{ color: '#0f172a' }}>{formatINR(totalAmountPaise)}</span>
                </div>
              </div>

              {/* Cancellation Guarantee */}
              <div className="p-3 rounded-2 bg-success-subtle text-success small border border-success-subtle">
                <div className="fw-bold d-flex align-items-center gap-1 mb-1">
                  <RiShieldCheckLine size={16} /> Free Cancellation Guarantee
                </div>
                <div>
                  Cancel up to 24 hours prior to check-in for a full simulated refund directly back to your payment source.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
