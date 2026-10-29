import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  RiHotelLine,
  RiCompass3Line,
  RiMapPinLine,
  RiCalendarCheckLine,
  RiDashboardLine,
  RiShieldCheckLine,
  RiUser3Line,
  RiLogoutBoxRLine,
  RiMenu3Line,
  RiCloseLine
} from 'react-icons/ri';

export default function Navbar() {
  const { user, isAuthenticated, isManager, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-staysphere">
      <div className="container">
        {/* Brand */}
        <Link to="/" className="navbar-brand brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <span style={{ fontSize: '1.6rem' }}>🏨</span>
          Stay<span>Sphere</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none p-1"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <RiCloseLine size={26} /> : <RiMenu3Line size={26} />}
        </button>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show mt-3 mt-lg-0' : ''}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/explore"
                className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <RiCompass3Line className="me-1" /> Explore Hotels
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/destinations"
                className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <RiMapPinLine className="me-1" /> Destinations
              </NavLink>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink
                  to="/my-bookings"
                  className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <RiCalendarCheckLine className="me-1" /> My Bookings
                </NavLink>
              </li>
            )}
            {isManager && (
              <li className="nav-item">
                <NavLink
                  to="/manager"
                  className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <RiDashboardLine className="me-1" /> Manager Portal
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <RiShieldCheckLine className="me-1" /> Admin Portal
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right Action / Auth */}
          <div className="d-flex align-items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline-navy btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary-navy btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="dropdown position-relative">
                <button
                  className="btn btn-outline-navy btn-sm d-flex align-items-center gap-2 dropdown-toggle"
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span
                    className="rounded-circle bg-teal text-white d-inline-flex align-items-center justify-content-center"
                    style={{ width: '26px', height: '26px', backgroundColor: '#0d9488', fontSize: '0.8rem' }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  <span className="d-none d-sm-inline fw-semibold">{user?.name?.split(' ')[0]}</span>
                  <span className="badge bg-secondary ms-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
                    {user?.role}
                  </span>
                </button>

                {dropdownOpen && (
                  <div
                    className="dropdown-menu dropdown-menu-end show shadow-lg border-0 py-2 mt-2"
                    style={{ minWidth: '220px', borderRadius: '12px' }}
                  >
                    <div className="px-3 py-2 border-bottom">
                      <div className="fw-bold text-truncate">{user?.name}</div>
                      <div className="small text-muted text-truncate">{user?.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      className="dropdown-item py-2 d-flex align-items-center gap-2"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <RiUser3Line /> My Profile
                    </Link>

                    <Link
                      to="/my-bookings"
                      className="dropdown-item py-2 d-flex align-items-center gap-2"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <RiCalendarCheckLine /> My Bookings
                    </Link>

                    {isManager && (
                      <Link
                        to="/manager"
                        className="dropdown-item py-2 d-flex align-items-center gap-2"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <RiDashboardLine /> Manager Dashboard
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="dropdown-item py-2 d-flex align-items-center gap-2"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <RiShieldCheckLine /> Admin Dashboard
                      </Link>
                    )}

                    <div className="dropdown-divider my-1"></div>

                    <button
                      className="dropdown-item py-2 text-danger d-flex align-items-center gap-2"
                      onClick={handleLogout}
                    >
                      <RiLogoutBoxRLine /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
