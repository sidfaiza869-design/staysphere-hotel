import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatINR, formatDate } from '../../src/utils/formatters';
import toast from 'react-hot-toast';
import {
  RiStarFill,
  RiMapPinLine,
  RiShieldCheckLine,
  RiPhoneLine,
  RiMailLine,
  RiTimeLine,
  RiCheckLine,
  RiCalendarCheckLine,
  RiUserLine,
  RiSparklingLine,
  RiArrowRightLine
} from 'react-icons/ri';

export default function HotelDetails() {
  const { identifier } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking selector state
  const today = new Date();
  const defaultCheckIn = new Date(today);
  defaultCheckIn.setDate(today.getDate() + 1);
  const defaultCheckOut = new Date(today);
  defaultCheckOut.setDate(today.getDate() + 3);

  const formatDateValue = (d) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(formatDateValue(defaultCheckIn));
  const [checkOut, setCheckOut] = useState(formatDateValue(defaultCheckOut));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState({});

  useEffect(() => {
    async function fetchHotel() {
      setLoading(true);
      try {
        const res = await api.get(`/hotels/${identifier}`);
        if (res.success && res.data?.hotel) {
          setHotel(res.data.hotel);
          setRoomTypes(res.data.roomTypes || []);
          setReviews(res.data.reviews || []);
          setActiveImage(res.data.hotel.featuredImage || res.data.hotel.images?.[0] || '');
          if (res.data.roomTypes?.length > 0) {
            setSelectedRoomId(res.data.roomTypes[0]._id);
          }
        }
      } catch (err) {
        toast.error('Hotel not found or unavailable');
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    }
    fetchHotel();
  }, [identifier, navigate]);

  // Check live room availability when dates or rooms change
  useEffect(() => {
    async function checkAllRooms() {
      if (!hotel?._id || !checkIn || !checkOut) return;
      try {
        const res = await api.get(`/availability/hotel/${hotel._id}?checkIn=${checkIn}&checkOut=${checkOut}`);
        if (res.success && res.data?.roomTypes) {
          const statusMap = {};
          res.data.roomTypes.forEach((rt) => {
            statusMap[rt._id] = {
              availableRooms: rt.availableRooms,
              isAvailable: rt.isAvailable
            };
          });
          setAvailabilityStatus(statusMap);
        }
      } catch (err) {
        console.error('Availability check failed:', err);
      }
    }
    checkAllRooms();
  }, [hotel?._id, checkIn, checkOut]);

  const handleBookNow = (room) => {
    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out date must be strictly after check-in date');
      return;
    }

    const roomStatus = availabilityStatus[room._id];
    if (roomStatus && !roomStatus.isAvailable) {
      toast.error(`Sorry, ${room.name} is fully booked for selected dates.`);
      return;
    }

    // Navigate to checkout
    navigate('/checkout', {
      state: {
        hotel,
        roomType: room,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: { adults: guests, children: 0 },
        numberOfRooms: rooms
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" style={{ color: '#0d9488' }} role="status"></div>
        <div className="mt-2 text-muted small">Loading hotel details...</div>
      </div>
    );
  }

  if (!hotel) return null;

  return (
    <div className="py-4">
      <div className="container">
        {/* Header Title & Badges */}
        <div className="mb-3">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span className="badge-star d-inline-flex align-items-center gap-1">
              <RiStarFill size={13} /> {hotel.starCategory} Star Property
            </span>
            <span className="badge-tag text-uppercase">{hotel.hotelType}</span>
            <span className="badge bg-light text-dark border">
              ★ {hotel.averageRating ? Number(hotel.averageRating).toFixed(1) : '4.3'} ({hotel.reviewCount || 15} Reviews)
            </span>
          </div>

          <h1 className="fw-bold mb-1">{hotel.name}</h1>
          <p className="text-muted mb-0 d-flex align-items-center gap-1">
            <RiMapPinLine className="text-teal" style={{ color: '#0d9488' }} />
            {hotel.address}, {hotel.locality}, {hotel.city}, {hotel.state} — {hotel.pinCode}
          </p>
        </div>

        {/* Image Gallery */}
        <div className="row g-2 mb-4">
          <div className="col-lg-8">
            <div style={{ height: '420px', borderRadius: '14px', overflow: 'hidden' }}>
              <img
                src={activeImage}
                alt={hotel.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-2 h-100">
              {(hotel.images || []).slice(0, 3).map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    height: '135px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: activeImage === img ? '2.5px solid #0d9488' : '1px solid #e2e8f0'
                  }}
                  onClick={() => setActiveImage(img)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Main Content Column */}
          <div className="col-lg-8">
            {/* Description */}
            <div className="bg-white p-4 border rounded-3 shadow-sm mb-4">
              <h4 className="fw-bold mb-3">About the Property</h4>
              <p className="text-secondary" style={{ lineHeight: 1.7, fontSize: '0.98rem' }}>
                {hotel.description}
              </p>
              {hotel.tagline && (
                <div className="p-3 bg-light rounded-2 border-start border-4 border-teal fst-italic text-dark">
                  "{hotel.tagline}"
                </div>
              )}
            </div>

            {/* Property Amenities */}
            <div className="bg-white p-4 border rounded-3 shadow-sm mb-4">
              <h4 className="fw-bold mb-3">Property Amenities & Facilities</h4>
              <div className="row g-3">
                {(hotel.amenities || []).map((amenity, idx) => (
                  <div key={idx} className="col-md-4 col-6">
                    <div className="d-flex align-items-center gap-2 small fw-semibold text-secondary">
                      <RiCheckLine style={{ color: '#0d9488' }} size={18} />
                      <span>{amenity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Room Types */}
            <div className="bg-white p-4 border rounded-3 shadow-sm mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Select Room Type</h4>
                <span className="badge bg-light text-dark border">
                  {roomTypes.length} Room Options Available
                </span>
              </div>

              <div className="d-flex flex-column gap-3">
                {roomTypes.map((room) => {
                  const status = availabilityStatus[room._id];
                  const isAvailable = status ? status.isAvailable : true;
                  const availableRoomsCount = status ? status.availableRooms : room.totalInventory;

                  return (
                    <div
                      key={room._id}
                      className="border rounded-3 p-3 position-relative"
                      style={{
                        backgroundColor: isAvailable ? '#ffffff' : '#f8fafc',
                        borderLeft: isAvailable ? '4px solid #0d9488' : '4px solid #cbd5e1'
                      }}
                    >
                      <div className="row g-3 align-items-center">
                        <div className="col-md-8">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h5 className="fw-bold mb-0">{room.name}</h5>
                            {room.breakfastIncluded && (
                              <span className="badge bg-success-subtle text-success border border-success-subtle small">
                                Free Breakfast
                              </span>
                            )}
                            {room.freeCancellation && (
                              <span className="badge bg-info-subtle text-info border border-info-subtle small">
                                Free Cancellation
                              </span>
                            )}
                          </div>

                          <p className="small text-muted mb-2">{room.description}</p>

                          <div className="d-flex flex-wrap gap-3 small text-secondary mb-2">
                            <span>🛏️ {room.bedConfiguration}</span>
                            <span>👥 Max {room.capacity?.maxGuests || 3} Guests</span>
                            <span>📐 {room.roomSizeSqFt} sq ft</span>
                          </div>

                          {/* Inventory status badge */}
                          <div>
                            {isAvailable ? (
                              <span className="text-success small fw-semibold">
                                ✓ Available for selected dates ({availableRoomsCount} left)
                              </span>
                            ) : (
                              <span className="text-danger small fw-semibold">
                                ✕ Sold out for selected dates
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-md-4 text-md-end">
                          <div className="price-tag mb-1">{formatINR(room.pricePerNightPaise)}</div>
                          <div className="small text-muted mb-2">per room / night</div>
                          <button
                            onClick={() => handleBookNow(room)}
                            disabled={!isAvailable}
                            className={`btn btn-sm ${isAvailable ? 'btn-teal' : 'btn-secondary'} px-3 py-2 w-100 w-md-auto`}
                          >
                            {isAvailable ? 'Book This Room' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hotel Policies & House Rules */}
            <div className="bg-white p-4 border rounded-3 shadow-sm mb-4">
              <h4 className="fw-bold mb-3">Hotel Policies & House Rules</h4>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <div className="p-3 bg-light rounded-2 border">
                    <div className="small text-muted fw-bold text-uppercase mb-1">Standard Timings</div>
                    <div className="fw-semibold">
                      Check-in: <span className="text-teal" style={{ color: '#0d9488' }}>{hotel.policies?.checkInTime || '14:00'}</span>
                    </div>
                    <div className="fw-semibold">
                      Check-out: <span className="text-teal" style={{ color: '#0d9488' }}>{hotel.policies?.checkOutTime || '11:00'}</span>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="p-3 bg-light rounded-2 border">
                    <div className="small text-muted fw-bold text-uppercase mb-1">Cancellation Terms</div>
                    <div className="small text-secondary">
                      {hotel.policies?.cancellationPolicy ||
                        'Free cancellation up to 24 hours prior to check-in. Non-refundable afterwards.'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="fw-bold mb-2">House Rules</h6>
                <ul className="small text-secondary mb-0 ps-3">
                  {(hotel.policies?.houseRules || []).map((rule, idx) => (
                    <li key={idx} className="mb-1">{rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Verified Reviews Section */}
            <div className="bg-white p-4 border rounded-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold mb-0">Verified Guest Reviews</h4>
                  <p className="small text-muted mb-0">
                    Average Rating: {hotel.averageRating ? Number(hotel.averageRating).toFixed(1) : '4.3'} out of 5 stars
                  </p>
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  100% Verified Stays
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="p-4 bg-light rounded-2 text-center text-muted small">
                  No guest reviews yet. Completed stays will display here!
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="border-bottom pb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '32px', height: '32px', backgroundColor: '#0f172a', fontSize: '0.8rem' }}
                          >
                            {rev.guestName?.charAt(0) || 'G'}
                          </span>
                          <div>
                            <div className="fw-bold small">{rev.guestName || 'Guest'}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              Verified Stay • {formatDate(rev.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="badge bg-warning text-dark">
                          ★ {rev.rating} / 5
                        </div>
                      </div>

                      {rev.title && <div className="fw-semibold small mt-2">{rev.title}</div>}
                      <p className="small text-secondary mb-0 mt-1">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Booking Sidebar */}
          <div className="col-lg-4">
            <div className="bg-white p-4 border rounded-3 shadow-sm sticky-top" style={{ top: '90px' }}>
              <div className="mb-3">
                <span className="small text-muted">Daily Room Rate from</span>
                <div className="price-tag">{formatINR(hotel.startingPricePaise || 199900)}</div>
                <div className="small text-muted">+ 12% sample GST</div>
              </div>

              <div className="border-top pt-3 mb-3">
                <h6 className="fw-bold mb-2">Configure Your Stay</h6>

                <div className="mb-2">
                  <label className="form-label small fw-bold text-muted mb-1">Check-In Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-bold text-muted mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    min={checkIn}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted mb-1">Guests</label>
                    <select
                      className="form-select form-select-sm"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted mb-1">Rooms</label>
                    <select
                      className="form-select form-select-sm"
                      value={rooms}
                      onChange={(e) => setRooms(parseInt(e.target.value, 10))}
                    >
                      <option value="1">1 Room</option>
                      <option value="2">2 Rooms</option>
                      <option value="3">3 Rooms</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-light rounded-2 border mb-3 small text-secondary">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Stay Duration:</span>
                    <span className="fw-semibold">
                      {Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))} Night(s)
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Selected Rooms:</span>
                    <span className="fw-semibold">{rooms} Room</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const roomToBook = roomTypes.find((r) => r._id === selectedRoomId) || roomTypes[0];
                    if (roomToBook) handleBookNow(roomToBook);
                  }}
                  className="btn btn-teal w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  Proceed to Checkout <RiArrowRightLine />
                </button>
              </div>

              {/* Direct Hotel Assistance */}
              <div className="pt-3 border-top small text-muted">
                <div className="fw-bold text-dark mb-1">Direct Hotel Contact</div>
                <div className="d-flex align-items-center gap-1 mb-1">
                  <RiPhoneLine className="text-teal" /> {hotel.contactPhone || '+91 98765 43210'}
                </div>
                <div className="d-flex align-items-center gap-1">
                  <RiMailLine className="text-teal" /> {hotel.contactEmail || 'reservations@staysphere.com'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
