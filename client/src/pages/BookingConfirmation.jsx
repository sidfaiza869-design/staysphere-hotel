import React, { useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { formatINR, formatDate } from '../utils/formatters';
import {
  RiCheckDoubleLine,
  RiPrinterLine,
  RiCalendarLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiShieldCheckLine,
  RiArrowRightLine
} from 'react-icons/ri';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const receiptRef = useRef();

  const booking = state?.booking;

  const handlePrint = () => {
    window.print();
  };

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold mb-3">No recent booking found</h3>
        <p className="text-muted mb-4">View your confirmed stays in your dashboard.</p>
        <Link to="/my-bookings" className="btn btn-teal">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  const {
    bookingReference,
    hotel,
    roomType,
    checkInDate,
    checkOutDate,
    numberOfNights,
    numberOfRooms,
    guestDetails,
    pricing,
    payment,
    createdAt
  } = booking;

  return (
    <div className="py-4">
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Success Banner */}
        <div className="bg-white border rounded-3 p-4 text-center shadow-sm mb-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: '64px', height: '64px', backgroundColor: '#ccfbf1', color: '#0d9488' }}
          >
            <RiCheckDoubleLine size={36} />
          </div>
          <h2 className="fw-bold mb-1">Your Reservation is Confirmed!</h2>
          <p className="text-muted mb-3">
            A confirmation email has been dispatched to <strong>{guestDetails?.email}</strong>.
          </p>

          <div className="d-inline-flex align-items-center gap-2 p-2 px-3 rounded-3 bg-light border">
            <span className="small text-muted text-uppercase fw-bold">Booking Reference:</span>
            <span className="fw-bold fs-5 text-dark letter-spacing-1">{bookingReference}</span>
          </div>
        </div>

        {/* Printable Receipt Card */}
        <div ref={receiptRef} className="bg-white border rounded-3 p-4 p-md-5 shadow-sm mb-4">
          {/* Invoice Header */}
          <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
            <div>
              <div className="brand-logo mb-1" style={{ fontSize: '1.4rem' }}>
                <span>🏨</span> Stay<span>Sphere</span>
              </div>
              <div className="small text-muted">StaySphere Hospitality Technologies Pvt. Ltd.</div>
              <div className="small text-muted">Scheme 54, Vijay Nagar, Indore, MP 452010</div>
              <div className="small text-muted">GSTIN: 23AAAAA0000A1Z5 (Demo Registered)</div>
            </div>

            <div className="text-end">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold mb-2">
                PAID & CONFIRMED
              </span>
              <div className="small text-muted">Receipt Date: {formatDate(createdAt || new Date())}</div>
              <div className="small text-muted">Ref: {bookingReference}</div>
            </div>
          </div>

          {/* Hotel & Stay Information */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <h6 className="fw-bold text-uppercase text-muted small mb-2">Property Details</h6>
              <div className="fw-bold fs-6 mb-1">{hotel?.name}</div>
              <div className="small text-secondary mb-1">
                <RiMapPinLine className="text-teal" /> {hotel?.address}, {hotel?.locality}, {hotel?.city}, {hotel?.state} — {hotel?.pinCode}
              </div>
              <div className="small text-muted">Phone: {hotel?.contactPhone || '+91 98765 43210'}</div>
            </div>

            <div className="col-md-6">
              <h6 className="fw-bold text-uppercase text-muted small mb-2">Primary Guest Details</h6>
              <div className="fw-bold fs-6 mb-1">{guestDetails?.fullName}</div>
              <div className="small text-secondary mb-1">{guestDetails?.email}</div>
              <div className="small text-secondary mb-1">Phone: +91 {guestDetails?.phone}</div>
              <div className="small text-muted">
                Origin: {guestDetails?.city}, {guestDetails?.state}
              </div>
            </div>
          </div>

          {/* Stay Timings */}
          <div className="p-3 bg-light rounded-3 border mb-4">
            <div className="row text-center g-2">
              <div className="col-4 border-end">
                <div className="small text-muted text-uppercase fw-bold">Check-In</div>
                <div className="fw-bold">{formatDate(checkInDate)}</div>
                <div className="small text-muted">From 14:00 hrs</div>
              </div>
              <div className="col-4 border-end">
                <div className="small text-muted text-uppercase fw-bold">Check-Out</div>
                <div className="fw-bold">{formatDate(checkOutDate)}</div>
                <div className="small text-muted">Until 11:00 hrs</div>
              </div>
              <div className="col-4">
                <div className="small text-muted text-uppercase fw-bold">Duration</div>
                <div className="fw-bold">{numberOfNights} Night(s)</div>
                <div className="small text-muted">{numberOfRooms} Room(s)</div>
              </div>
            </div>
          </div>

          {/* Itemized Price Table */}
          <div className="table-responsive mb-4">
            <table className="table table-bordered small">
              <thead className="table-light">
                <tr>
                  <th>Description</th>
                  <th className="text-center">Nights</th>
                  <th className="text-center">Rooms</th>
                  <th className="text-end">Nightly Rate</th>
                  <th className="text-end">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="fw-bold">{roomType?.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {roomType?.breakfastIncluded ? 'Complimentary Breakfast Included' : 'Room Only'}
                    </div>
                  </td>
                  <td className="text-center">{numberOfNights}</td>
                  <td className="text-center">{numberOfRooms}</td>
                  <td className="text-end">{formatINR(pricing?.roomRatePaise)}</td>
                  <td className="text-end fw-semibold">{formatINR(pricing?.baseAmountPaise)}</td>
                </tr>
                <tr>
                  <td colSpan="4" className="text-end text-muted">
                    Subtotal Base Rate:
                  </td>
                  <td className="text-end">{formatINR(pricing?.baseAmountPaise)}</td>
                </tr>
                <tr>
                  <td colSpan="4" className="text-end text-muted">
                    Sample GST (12% CGST + SGST):
                  </td>
                  <td className="text-end">{formatINR(pricing?.taxAmountPaise)}</td>
                </tr>
                <tr className="table-light fw-bold fs-6">
                  <td colSpan="4" className="text-end">
                    Total Paid (INR):
                  </td>
                  <td className="text-end" style={{ color: '#0d9488' }}>
                    {formatINR(pricing?.totalAmountPaise)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment & Cancellation Notes */}
          <div className="p-3 bg-light rounded-2 border small text-muted">
            <div className="fw-bold text-dark mb-1">
              Payment Transaction Reference: {payment?.providerPaymentId || 'DEMO_TXN_VERIFIED'}
            </div>
            <div>
              Payment Method: {payment?.paymentMethod || 'UPI / NetBanking (Demo Simulated)'} • Status: Successful
            </div>
            <div className="mt-1">
              Cancellation Policy: Free cancellation up to 24 hours prior to check-in via your My Bookings portal.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <button onClick={handlePrint} className="btn btn-outline-navy d-flex align-items-center gap-2">
            <RiPrinterLine /> Print / Download Receipt
          </button>

          <div className="d-flex gap-2">
            <Link to="/my-bookings" className="btn btn-primary-navy">
              View in My Bookings
            </Link>
            <Link to="/explore" className="btn btn-teal d-flex align-items-center gap-1">
              Explore More Hotels <RiArrowRightLine />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
