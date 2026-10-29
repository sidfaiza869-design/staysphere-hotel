import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  RiDashboardLine,
  RiHotelLine,
  RiCalendarCheckLine,
  RiDoorOpenLine,
  RiUserReceivedLine,
  RiMoneyDollarCircleLine,
  RiAddLine,
  RiSearchLine,
  RiCheckLine,
  RiCloseLine
} from 'react-icons/ri';

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Filter & Search for reservations
  const [searchRef, setSearchRef] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add Room Modal State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [targetHotelId, setTargetHotelId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomPriceRupees, setRoomPriceRupees] = useState('');
  const [roomInventory, setRoomInventory] = useState('5');
  const [bedConfig, setBedConfig] = useState('1 King Bed');
  const [roomSize, setRoomSize] = useState('320');
  const [breakfast, setBreakfast] = useState(false);
  const [submittingRoom, setSubmittingRoom] = useState(false);

  const loadManagerData = async () => {
    setLoading(true);
    try {
      const [statsRes, propsRes, resRes] = await Promise.all([
        api.get('/manager/stats'),
        api.get('/manager/properties'),
        api.get('/manager/reservations')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (propsRes.success) setProperties(propsRes.data?.hotels || []);
      if (resRes.success) setReservations(resRes.data?.reservations || []);
    } catch (err) {
      toast.error('Failed to load manager dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerData();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.patch(`/manager/reservations/${bookingId}/status`, {
        status: newStatus
      });
      if (res.success) {
        toast.success(res.message || 'Status updated');
        await loadManagerData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update reservation status');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!targetHotelId || !roomName || !roomPriceRupees) {
      toast.error('Please fill all required room fields');
      return;
    }

    setSubmittingRoom(true);
    try {
      const res = await api.post('/rooms', {
        hotelId: targetHotelId,
        name: roomName,
        pricePerNightPaise: Math.round(Number(roomPriceRupees) * 100),
        totalInventory: parseInt(roomInventory, 10),
        bedConfiguration: bedConfig,
        roomSizeSqFt: parseInt(roomSize, 10),
        breakfastIncluded: breakfast
      });

      if (res.success) {
        toast.success('Room type added successfully!');
        setShowRoomModal(false);
        setRoomName('');
        setRoomPriceRupees('');
        await loadManagerData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create room type');
    } finally {
      setSubmittingRoom(false);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.bookingStatus === statusFilter;
    const matchesSearch =
      !searchRef ||
      r.bookingReference?.toLowerCase().includes(searchRef.toLowerCase()) ||
      r.guestDetails?.fullName?.toLowerCase().includes(searchRef.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="badge-tag text-uppercase mb-1">Hotel Manager Operations</span>
            <h1 className="fw-bold mb-1">Manager Control Center</h1>
            <p className="text-muted mb-0">Oversee assigned properties, room inventory, and guest check-ins</p>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="d-flex gap-2 border-bottom pb-2 mb-4">
          <button
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-teal' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            <RiDashboardLine className="me-1" /> Overview & Stats
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'reservations' ? 'btn-teal' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('reservations')}
          >
            <RiCalendarCheckLine className="me-1" /> Reservations ({reservations.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'properties' ? 'btn-teal' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('properties')}
          >
            <RiHotelLine className="me-1" /> Managed Properties ({properties.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#0d9488' }} role="status"></div>
            <div className="mt-2 text-muted small">Loading manager portal...</div>
          </div>
        ) : (
          <>
            {/* 1. Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                {/* 6 Key Stats Cards */}
                <div className="row g-3 mb-4">
                  <div className="col-lg-2 col-md-4 col-6">
                    <div className="p-3 bg-white border rounded-3 shadow-sm">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Properties</div>
                      <h3 className="fw-bold mb-0 text-dark">{stats?.totalProperties || 0}</h3>
                      <div className="small text-muted">Managed Stays</div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-4 col-6">
                    <div className="p-3 bg-white border rounded-3 shadow-sm">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Total Rooms</div>
                      <h3 className="fw-bold mb-0 text-dark">{stats?.totalRooms || 0}</h3>
                      <div className="small text-muted">Inventory Units</div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-4 col-6">
                    <div className="p-3 bg-white border rounded-3 shadow-sm">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Today's Arrivals</div>
                      <h3 className="fw-bold mb-0 text-teal" style={{ color: '#0d9488' }}>
                        {stats?.todaysArrivals || 0}
                      </h3>
                      <div className="small text-muted">Guests Checking In</div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-4 col-6">
                    <div className="p-3 bg-white border rounded-3 shadow-sm">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Departures</div>
                      <h3 className="fw-bold mb-0 text-secondary">{stats?.todaysDepartures || 0}</h3>
                      <div className="small text-muted">Check-Outs</div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-4 col-6">
                    <div className="p-3 bg-white border rounded-3 shadow-sm">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Occupancy</div>
                      <h3 className="fw-bold mb-0 text-dark">{stats?.occupancyRate || 0}%</h3>
                      <div className="small text-muted">Current Load</div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-4 col-6">
                    <div className="p-3 bg-white border rounded-3 shadow-sm">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Revenue</div>
                      <h4 className="fw-bold mb-0 text-truncate" style={{ color: '#0f172a' }}>
                        {formatINR(stats?.totalRevenuePaise || 0)}
                      </h4>
                      <div className="small text-muted">Verified Total</div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings Table */}
                <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Recent Guest Reservations</h5>
                    <button
                      className="btn btn-link btn-sm text-teal text-decoration-none fw-bold"
                      onClick={() => setActiveTab('reservations')}
                    >
                      View All Reservations →
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover table-custom small mb-0">
                      <thead>
                        <tr>
                          <th>Ref Code</th>
                          <th>Guest Name</th>
                          <th>Hotel & Room</th>
                          <th>Check-In</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(stats?.recentBookings || []).map((b) => (
                          <tr key={b._id}>
                            <td className="fw-bold">{b.bookingReference}</td>
                            <td>
                              <div>{b.guestDetails?.fullName}</div>
                              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                +91 {b.guestDetails?.phone}
                              </div>
                            </td>
                            <td>
                              <div className="fw-semibold">{b.hotel?.name}</div>
                              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                {b.roomType?.name}
                              </div>
                            </td>
                            <td>{formatDate(b.checkInDate)}</td>
                            <td>
                              <span
                                className={`badge text-uppercase ${
                                  b.bookingStatus === 'confirmed'
                                    ? 'bg-success-subtle text-success border border-success-subtle'
                                    : b.bookingStatus === 'checked_in'
                                    ? 'bg-primary-subtle text-primary border border-primary-subtle'
                                    : 'bg-secondary-subtle text-secondary'
                                }`}
                              >
                                {b.bookingStatus.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="fw-bold">{formatINR(b.pricing?.totalAmountPaise)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Reservations Tab */}
            {activeTab === 'reservations' && (
              <div className="bg-white border rounded-3 p-4 shadow-sm">
                {/* Search & Filter Controls */}
                <div className="row g-2 mb-4">
                  <div className="col-md-6">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-end-0">
                        <RiSearchLine />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by reference code or guest name..."
                        value={searchRef}
                        onChange={(e) => setSearchRef(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Reservation Statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-custom small mb-0">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Guest Details</th>
                        <th>Property</th>
                        <th>Dates & Nights</th>
                        <th>Total (INR)</th>
                        <th>Status</th>
                        <th className="text-end">Manage Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map((b) => (
                        <tr key={b._id}>
                          <td className="fw-bold text-teal" style={{ color: '#0d9488' }}>
                            {b.bookingReference}
                          </td>
                          <td>
                            <div className="fw-semibold">{b.guestDetails?.fullName}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {b.guestDetails?.email} • +91 {b.guestDetails?.phone}
                            </div>
                          </td>
                          <td>
                            <div className="fw-semibold">{b.hotel?.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {b.roomType?.name}
                            </div>
                          </td>
                          <td>
                            <div>
                              {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {b.numberOfNights} Night(s) • {b.numberOfRooms} Room(s)
                            </div>
                          </td>
                          <td className="fw-bold">{formatINR(b.pricing?.totalAmountPaise)}</td>
                          <td>
                            <span
                              className={`badge text-uppercase ${
                                b.bookingStatus === 'confirmed'
                                  ? 'bg-success-subtle text-success border border-success-subtle'
                                  : b.bookingStatus === 'checked_in'
                                  ? 'bg-primary-subtle text-primary border border-primary-subtle'
                                  : b.bookingStatus === 'checked_out'
                                  ? 'bg-info-subtle text-info border border-info-subtle'
                                  : 'bg-danger-subtle text-danger border border-danger-subtle'
                              }`}
                            >
                              {b.bookingStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-1">
                              {b.bookingStatus === 'confirmed' && (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleUpdateStatus(b._id, 'checked_in')}
                                  title="Check In Guest"
                                >
                                  Check In
                                </button>
                              )}
                              {b.bookingStatus === 'checked_in' && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleUpdateStatus(b._id, 'checked_out')}
                                  title="Check Out Guest"
                                >
                                  Check Out
                                </button>
                              )}
                              {b.bookingStatus === 'confirmed' && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                                  title="Cancel Reservation"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Managed Properties Tab */}
            {activeTab === 'properties' && (
              <div>
                <div className="row g-4">
                  {properties.map((hotel) => (
                    <div key={hotel._id} className="col-lg-6">
                      <div className="bg-white border rounded-3 p-4 shadow-sm h-100">
                        <div className="d-flex gap-3 mb-3">
                          <img
                            src={hotel.featuredImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'}
                            alt={hotel.name}
                            className="rounded-3"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="d-flex gap-2 mb-1">
                              <span className="badge-tag text-uppercase">{hotel.hotelType}</span>
                              <span
                                className={`badge ${
                                  hotel.isActive ? 'bg-success-subtle text-success' : 'bg-secondary'
                                }`}
                              >
                                {hotel.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <h5 className="fw-bold mb-1">{hotel.name}</h5>
                            <div className="small text-muted">
                              {hotel.locality}, {hotel.city}, {hotel.state}
                            </div>
                            <div className="small fw-semibold mt-1" style={{ color: '#0d9488' }}>
                              Starts from {formatINR(hotel.startingPricePaise)} / night
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                          <div className="small text-muted">
                            Rating: ★ {hotel.averageRating ? Number(hotel.averageRating).toFixed(1) : '4.3'} ({hotel.reviewCount} Reviews)
                          </div>
                          <button
                            className="btn btn-teal btn-sm d-flex align-items-center gap-1"
                            onClick={() => {
                              setTargetHotelId(hotel._id);
                              setShowRoomModal(true);
                            }}
                          >
                            <RiAddLine /> Add Room Type
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Room Type Modal */}
            {showRoomModal && (
              <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg rounded-3">
                    <form onSubmit={handleCreateRoom}>
                      <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold">Add Room Type & Pricing</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowRoomModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label small fw-bold text-muted">Room Type Name *</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Deluxe Royal Room"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <label className="form-label small fw-bold text-muted">Nightly Price (₹ INR) *</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="e.g. 2999"
                              value={roomPriceRupees}
                              onChange={(e) => setRoomPriceRupees(e.target.value)}
                              required
                            />
                          </div>

                          <div className="col-6">
                            <label className="form-label small fw-bold text-muted">Room Inventory Units *</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min="1"
                              value={roomInventory}
                              onChange={(e) => setRoomInventory(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <label className="form-label small fw-bold text-muted">Bed Configuration</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="1 King Bed"
                              value={bedConfig}
                              onChange={(e) => setBedConfig(e.target.value)}
                            />
                          </div>

                          <div className="col-6">
                            <label className="form-label small fw-bold text-muted">Room Area (sq ft)</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="320"
                              value={roomSize}
                              onChange={(e) => setRoomSize(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="breakfastCheck"
                            checked={breakfast}
                            onChange={(e) => setBreakfast(e.target.checked)}
                          />
                          <label className="form-check-label small text-muted" htmlFor="breakfastCheck">
                            Complimentary breakfast included in this room rate
                          </label>
                        </div>
                      </div>
                      <div className="modal-footer border-top">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setShowRoomModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingRoom}
                          className="btn btn-teal btn-sm"
                        >
                          {submittingRoom ? 'Saving...' : 'Add Room Type'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
