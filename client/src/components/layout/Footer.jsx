import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  RiHotelLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiShieldCheckLine,
  RiSendPlaneFill
} from 'react-icons/ri';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thank you for subscribing to StaySphere travel updates!');
    setEmail('');
  };

  return (
    <footer className="footer-staysphere">
      <div className="container">
        <div className="row g-4 mb-5">
          {/* Brand & Intro */}
          <div className="col-lg-4 col-md-6">
            <div className="brand-logo text-white mb-3" style={{ fontSize: '1.5rem' }}>
              <span>🏨</span> Stay<span style={{ color: '#0d9488' }}>Sphere</span>
            </div>
            <p className="text-secondary small mb-3">
              StaySphere is India’s premier hospitality platform connecting travellers to curated hotels, heritage stays, and modern suites from Indore to Goa and across 18+ cities.
            </p>
            <div className="d-flex flex-column gap-2 small text-secondary">
              <div className="d-flex align-items-center gap-2">
                <RiPhoneLine style={{ color: '#0d9488' }} /> +91 (0731) 420-STAY / +91 98765 43210
              </div>
              <div className="d-flex align-items-center gap-2">
                <RiMailLine style={{ color: '#0d9488' }} /> reservations@staysphere.com
              </div>
              <div className="d-flex align-items-center gap-2">
                <RiMapPinLine style={{ color: '#0d9488' }} /> Scheme 54, Vijay Nagar, Indore, MP 452010
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="footer-heading">Explore</h6>
            <Link to="/explore?hotelType=luxury" className="footer-link">Luxury Retreats</Link>
            <Link to="/explore?hotelType=heritage" className="footer-link">Heritage Havens</Link>
            <Link to="/explore?hotelType=budget" className="footer-link">Budget Stays</Link>
            <Link to="/explore?hotelType=business" className="footer-link">Business Hotels</Link>
            <Link to="/destinations" className="footer-link">All Destinations</Link>
          </div>

          {/* Top Indian Destinations */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="footer-heading">Top Cities</h6>
            <Link to="/explore?city=Indore" className="footer-link">Indore</Link>
            <Link to="/explore?city=Bhopal" className="footer-link">Bhopal</Link>
            <Link to="/explore?city=Mumbai" className="footer-link">Mumbai</Link>
            <Link to="/explore?city=Jaipur" className="footer-link">Jaipur</Link>
            <Link to="/explore?city=Goa" className="footer-link">Goa</Link>
            <Link to="/explore?city=Udaipur" className="footer-link">Udaipur</Link>
          </div>

          {/* Newsletter / Updates */}
          <div className="col-lg-4 col-md-6">
            <h6 className="footer-heading">Exclusive Travel Offers</h6>
            <p className="text-secondary small mb-3">
              Subscribe to receive weekly curated staycation deals and special early-bird rates across Indian destinations.
            </p>
            <form onSubmit={handleSubscribe} className="d-flex gap-2 mb-3">
              <input
                type="email"
                className="form-control form-control-sm bg-dark text-white border-secondary"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-teal btn-sm text-nowrap d-flex align-items-center gap-1">
                Subscribe <RiSendPlaneFill size={14} />
              </button>
            </form>
            <div className="p-2 rounded bg-dark border border-secondary small text-secondary">
              <span className="badge-demo me-1">DEMO PLATFORM</span>
              All bookings, payments, and invoices in this system are simulated for demonstration. Prices are in Indian Rupees (₹) with sample 12% GST breakdown.
            </div>
          </div>
        </div>

        <div className="pt-4 border-top border-secondary d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 small text-secondary">
          <div>
            © {new Date().getFullYear()} StaySphere Hospitality Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="d-flex gap-4">
            <span className="text-secondary">Privacy Policy</span>
            <span className="text-secondary">Terms & Conditions</span>
            <span className="text-secondary">Cancellation & Refund Rules</span>
            <span className="text-secondary">GST Compliance (12%)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
