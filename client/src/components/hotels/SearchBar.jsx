import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INDIAN_CITIES } from '../../utils/formatters';
import { RiMapPinLine, RiCalendarLine, RiUserLine, RiSearchLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function SearchBar({ initialValues = {} }) {
  const navigate = useNavigate();

  // Tomorrow & Day After Tomorrow defaults
  const today = new Date();
  const defaultCheckIn = new Date(today);
  defaultCheckIn.setDate(today.getDate() + 1);
  const defaultCheckOut = new Date(today);
  defaultCheckOut.setDate(today.getDate() + 3);

  const formatDateValue = (d) => d.toISOString().split('T')[0];

  const [city, setCity] = useState(initialValues.city || 'Indore');
  const [checkIn, setCheckIn] = useState(initialValues.checkIn || formatDateValue(defaultCheckIn));
  const [checkOut, setCheckOut] = useState(initialValues.checkOut || formatDateValue(defaultCheckOut));
  const [guests, setGuests] = useState(initialValues.guests || 2);
  const [rooms, setRooms] = useState(initialValues.rooms || 1);

  const handleSearch = (e) => {
    e.preventDefault();

    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    const params = new URLSearchParams();
    if (city && city !== 'All Cities') params.append('city', city);
    params.append('checkIn', checkIn);
    params.append('checkOut', checkOut);
    params.append('guests', guests);
    params.append('rooms', rooms);

    navigate(`/explore?${params.toString()}`);
  };

  const todayStr = formatDateValue(today);

  return (
    <form onSubmit={handleSearch} className="search-box-card">
      <div className="row g-3 align-items-end">
        {/* Destination */}
        <div className="col-lg-3 col-md-6">
          <label className="search-field-label">
            <RiMapPinLine className="me-1 text-teal" style={{ color: '#0d9488' }} /> Destination
          </label>
          <select
            className="form-select form-select-search"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {INDIAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {c === 'All Cities' ? 'All Indian Destinations' : `${c}, India`}
              </option>
            ))}
          </select>
        </div>

        {/* Check-In */}
        <div className="col-lg-2 col-md-3 col-6">
          <label className="search-field-label">
            <RiCalendarLine className="me-1 text-teal" style={{ color: '#0d9488' }} /> Check-In
          </label>
          <input
            type="date"
            className="form-control form-control-search"
            min={todayStr}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </div>

        {/* Check-Out */}
        <div className="col-lg-2 col-md-3 col-6">
          <label className="search-field-label">
            <RiCalendarLine className="me-1 text-teal" style={{ color: '#0d9488' }} /> Check-Out
          </label>
          <input
            type="date"
            className="form-control form-control-search"
            min={checkIn || todayStr}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>

        {/* Guests & Rooms */}
        <div className="col-lg-3 col-md-6 col-12">
          <div className="row g-2">
            <div className="col-6">
              <label className="search-field-label">
                <RiUserLine className="me-1 text-teal" style={{ color: '#0d9488' }} /> Guests
              </label>
              <select
                className="form-select form-select-search"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>
            <div className="col-6">
              <label className="search-field-label">Rooms</label>
              <select
                className="form-select form-select-search"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
              >
                <option value="1">1 Room</option>
                <option value="2">2 Rooms</option>
                <option value="3">3 Rooms</option>
                <option value="4">4+ Rooms</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="col-lg-2 col-md-6 col-12">
          <button
            type="submit"
            className="btn btn-teal w-100 d-flex align-items-center justify-content-center gap-2 py-2"
            style={{ height: '46px' }}
          >
            <RiSearchLine size={18} />
            <span>Search Hotels</span>
          </button>
        </div>
      </div>
    </form>
  );
}
