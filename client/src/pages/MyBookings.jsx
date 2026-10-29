import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  RiCalendarCheckLine,
  RiMapPinLine,
  RiPrinterLine,
  RiCloseCircleLine,
  RiStarFill,
  RiErrorWarningLine
} from 'react-icons/ri';

export default function MyBookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookingsData, setBookingsData] = useState({
    all: [],
    upcoming: [],
    past: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cancellation modal state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.success && res.data) {
        setBookingsData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load your reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await api.post(`/bookings/${cancelTarget._id}/cancel`, {
        reason: 'Guest requested cancellation via portal'
      });
      if (res.success) {
        toast.success(res.message || 'Booking cancelled successfully');
        setCancelTarget(null);
        await fetchBookings();
      }
    } catch (err) {
      toast.error(err.message || 'Could not cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    if (reviewComment.length < 10) {
      toast.error('Please provide at least 10 characters in your review feedback');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        bookingId: reviewBooking._id,
        rating,
        title: reviewTitle,
        comment: reviewComment
      });
      if (res.success) {
        toast.success('Your verified review has been posted!');
        setReviewBooking(null);
        setReviewTitle('');
        setReviewComment('');
        await fetchBookings();
      }
    } catch (err) {
      toast.error(err.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentList = bookingsData[activeTab] || [];

  return (
    <div className="py-4">
      <div className="container">
        {/* Header */}
        <div className="mb-4">
          <h1 className="fw-bold mb-1">My Reservations</h1>
          <p className="text-muted mb-0">View booking vouchers, request cancellations, or submit verified reviews</p>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 border-bottom pb-2 mb-4">
          <button
            className={`btn btn-sm ${activeTab === 'upcoming' ? 'btn-teal' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Stays ({bookingsData.upcoming.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'past' ? 'btn-teal' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('past')}
          >
            Completed Stays ({bookingsData.past.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'cancelled' ? 'btn-teal' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled ({bookingsData.cancelled.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#0d9488' }} role="status"></div>
            <div className="mt-2 text-muted small">Loading reservations...</div>
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-white p-5 border rounded-3 text-center">
            <div className="fs-1 mb-3">🏨</div>
            <h5 className="fw-bold">No {activeTab} bookings found</h5>
            <p className="text-muted small mb-4">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming reservations. Plan your next staycation across India!"
                : `No bookings found in the ${activeTab} category.`}
            </p>
            <Link to="/explore" className="btn btn-teal">
              Discover Hotels
            </Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {currentList.map((booking) => {
              const checkIn = new Date(booking.checkInDate);
              const now = new Date();
              const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
              const canCancel = booking.bookingStatus === 'confirmed' && hoursUntilCheckIn > 0;

              return (
                <div key={booking._id} className="bg-white border rounded-3 p-4 shadow-sm">
                  <div className="row g-3 align-items-center">
                    {/* Hotel Image */}
                    <div className="col-md-3 col-sm-4">
                      <img
                        src={booking.hotel?.featuredImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                        alt={booking.hotel?.name}
                        className="rounded-3 w-100"
                        style={{ height: '140px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Details */}
                    <div className="col-md-6 col-sm-8">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-light text-dark border small">
                          Ref: {booking.bookingReference}
                        </span>
                        <span
                          className={`badge small text-uppercase ${
                            booking.bookingStatus === 'confirmed'
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : booking.bookingStatus === 'checked_out'
                              ? 'bg-info-subtle text-info border border-info-subtle'
                              : 'bg-danger-subtle text-danger border border-danger-subtle'
                          }`}
                        >
                          {booking.bookingStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <h5 className="fw-bold mb-1">{booking.hotel?.name}</h5>
                      <div className="small text-muted mb-2">
                        <RiMapPinLine className="text-teal" /> {booking.hotel?.city}, {booking.hotel?.state}
                      </div>

                      <div className="d-flex flex-wrap gap-3 small text-secondary">
                        <span>
                          <strong>Check-In:</strong> {formatDate(booking.checkInDate)}
                        </span>
                        <span>
                          <strong>Check-Out:</strong> {formatDate(booking.checkOutDate)}
                        </span>
                        <span>
                          <strong>Room:</strong> {booking.roomType?.name} ({booking.numberOfRooms} Room)
                        </span>
                      </div>

                      {/* Cancellation details note if cancelled */}
                      {booking.bookingStatus === 'cancelled' && (
                        <div className="mt-2 small text-danger p-2 bg-danger-subtle rounded border border-danger-subtle">
                          Cancelled on {formatDate(booking.cancellationDetails?.cancelledAt)}. Refund status: {booking.cancellationDetails?.refundStatus} (Amount: {formatINR(booking.cancellationDetails?.refundAmountPaise)})
                        </div>
                      )}
                    </div>

                    {/* Pricing & Actions */}
                    <div className="col-md-3 text-md-end border-top border-md-top-0 pt-3 pt-md-0">
                      <div className="price-tag mb-1">{formatINR(booking.pricing?.totalAmountPaise)}</div>
                      <div className="small text-muted mb-3">Total Paid (with 12% GST)</div>

                      <div className="d-flex flex-column gap-2">
                        {/* Printable Receipt */}
                        <button
                          onClick={() =>
                            navigate('/booking-confirmation', { state: { booking } })
                          }
                          className="btn btn-outline-navy btn-sm d-flex align-items-center justify-content-center gap-1"
                        >
                          <RiPrinterLine /> View Receipt
                        </button>

                        {/* Cancel Booking Button */}
                        {canCancel && (
                          <button
                            onClick={() => setCancelTarget(booking)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            Cancel Stay
                          </button>
                        )}

                        {/* Review Stay Button */}
                        {booking.bookingStatus === 'checked_out' && !booking.hasReviewed && (
                          <button
                            onClick={() => setReviewBooking(booking)}
                            className="btn btn-teal btn-sm d-flex align-items-center justify-content-center gap-1"
                          >
                            <RiStarFill /> Write Review
                          </button>
                        )}

                        {booking.hasReviewed && (
                          <span className="badge bg-light text-muted border py-2">
                            ✓ Review Submitted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancelTarget && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                    <RiErrorWarningLine size={24} /> Confirm Stay Cancellation
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setCancelTarget(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-3">
                    Are you sure you want to cancel your reservation for <strong>{cancelTarget.hotel?.name}</strong> (Ref: {cancelTarget.bookingReference})?
                  </p>

                  <div className="p-3 bg-light rounded border small mb-3">
                    <div className="fw-bold mb-1">Cancellation Terms:</div>
                    <div>
                      • Cancellations more than 24 hours prior to check-in are eligible for a <strong>100% simulated refund</strong> ({formatINR(cancelTarget.pricing?.totalAmountPaise)}).
                    </div>
                    <div>
                      • The reserved room inventory will immediately be released back to the property.
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCancelTarget(null)}
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    disabled={cancelling}
                    className="btn btn-danger btn-sm"
                    onClick={handleConfirmCancel}
                  >
                    {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Write Verified Review Modal */}
        {reviewBooking && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <form onSubmit={handlePostReview}>
                  <div className="modal-header border-bottom">
                    <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                      <RiStarFill className="text-warning" /> Rate Your Completed Stay
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setReviewBooking(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <div className="fw-bold">{reviewBooking.hotel?.name}</div>
                      <div className="small text-muted">{reviewBooking.roomType?.name}</div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Star Rating</label>
                      <div className="d-flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            className={`btn btn-sm ${rating >= s ? 'btn-warning' : 'btn-outline-secondary'}`}
                            onClick={() => setRating(s)}
                          >
                            ★ {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Review Headline</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Wonderful hospitality & spotless rooms"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Detailed Feedback (min 10 chars) *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Share your experience regarding food, staff, room comfort, and cleanliness..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-top">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setReviewBooking(null)}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn btn-teal btn-sm"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
