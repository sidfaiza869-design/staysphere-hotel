import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SearchBar from '../components/hotels/SearchBar';
import HotelCard from '../components/hotels/HotelCard';
import { formatINR } from '../utils/formatters';
import {
  RiShieldCheckLine,
  RiMoneyDollarCircleLine,
  RiCustomerService2Line,
  RiFlashlightLine,
  RiCheckDoubleLine,
  RiMapPinLine,
  RiArrowRightLine,
  RiCompass3Line,
  RiStarFill
} from 'react-icons/ri';

export default function Home() {
  const navigate = useNavigate();
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [hotelsRes, destsRes] = await Promise.all([
          api.get('/hotels/featured'),
          api.get('/hotels/destinations')
        ]);
        if (hotelsRes.success) {
          setFeaturedHotels(hotelsRes.data?.hotels || []);
        }
        if (destsRes.success) {
          setDestinations(destsRes.data?.destinations || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const CATEGORIES = [
    { id: 'luxury', title: 'Luxury & Palaces', desc: '5-star royal suites & heritage mansions', icon: '👑', query: 'hotelType=luxury' },
    { id: 'business', title: 'Business Stays', desc: 'Fast Wi-Fi, workstations & prime tech hubs', icon: '💼', query: 'hotelType=business' },
    { id: 'budget', title: 'Smart Budget', desc: 'Comfortable, verified stays under ₹1,999', icon: '🏷️', query: 'hotelType=budget' },
    { id: 'resort', title: 'Resorts & Retreats', desc: 'Beachfront villas & peaceful mountain lodges', icon: '🌴', query: 'hotelType=resort' },
    { id: 'heritage', title: 'Heritage Havens', desc: 'Authentic Rajasthani & Malwa architectural gems', icon: '🏛️', query: 'hotelType=heritage' }
  ];

  const FAQS = [
    {
      q: 'How does the StaySphere booking and payment process work?',
      a: 'Select your preferred Indian destination, stay dates, and room type. At checkout, review the transparent breakdown with base rate and sample 12% GST. You can complete the reservation instantly using our safe demo payment flow (simulated UPI / Card) without entering real banking credentials.'
    },
    {
      q: 'What is the cancellation and refund policy?',
      a: 'Most properties offer free cancellation up to 24 hours prior to check-in with 100% simulated refund eligibility. For cancellations within 24 hours, a 50% cancellation fee applies and inventory is immediately released back to the hotel.'
    },
    {
      q: 'Which government IDs are accepted at hotel check-in across India?',
      a: 'All Indian adult guests must present a valid physical or digital government-issued photo identity proof (Aadhaar Card, Passport, Voter ID, or Driving License). PAN cards are typically not accepted by hotels as address proof.'
    },
    {
      q: 'How are hotel prices and taxes displayed on StaySphere?',
      a: 'All prices are displayed in Indian Rupees (₹) using standard Indian numbering format (e.g. ₹2,499 / night). Invoices clearly separate the base room price, applied discounts, and a configurable sample 12% GST (6% CGST + 6% SGST).'
    }
  ];

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-wrapper text-center">
        <div className="container">
          <span className="badge-demo mb-3 d-inline-block px-3 py-1 text-uppercase">
            India's Modern Hospitality Network
          </span>
          <h1 className="hero-heading">Your Next Stay Starts Here.</h1>
          <p className="hero-lead">
            Discover curated luxury palaces, tranquil beach resorts, and smart business hotels across 18+ Indian cities. Transparent INR rates, verified stays, and instant booking confirmation.
          </p>
        </div>
      </section>

      {/* 2. Floating Search Form */}
      <div className="container mb-5">
        <SearchBar />
      </div>

      {/* 3. Popular Indian Destinations */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-teal fw-bold small text-uppercase" style={{ color: '#0d9488' }}>
                Explore India
              </span>
              <h2 className="fw-bold mb-1">Popular Indian Destinations</h2>
              <p className="text-muted mb-0">From royal Jaipur to the shores of Goa and heritage Indore</p>
            </div>
            <Link to="/destinations" className="btn btn-outline-navy btn-sm d-none d-md-flex align-items-center gap-1">
              View All Cities <RiArrowRightLine />
            </Link>
          </div>

          <div className="row g-4">
            {destinations.slice(0, 6).map((dest) => (
              <div key={dest.city} className="col-lg-4 col-md-6">
                <div
                  className="dest-card"
                  onClick={() => navigate(`/explore?city=${encodeURIComponent(dest.city)}`)}
                >
                  <img src={dest.image} alt={dest.city} loading="lazy" />
                  <div className="dest-overlay">
                    <div className="badge bg-white text-dark align-self-start mb-2 fw-semibold px-2 py-1" style={{ fontSize: '0.72rem' }}>
                      {dest.hotelCount} {dest.hotelCount === 1 ? 'Hotel' : 'Hotels'}
                    </div>
                    <h4 className="fw-bold mb-0 text-white">{dest.city}</h4>
                    <p className="small mb-1 text-light opacity-75">{dest.state}</p>
                    <div className="small fw-semibold" style={{ color: '#5eead4' }}>
                      Stays from {formatINR(dest.startingPricePaise)} / night
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Category Stays */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-teal fw-bold small text-uppercase" style={{ color: '#0d9488' }}>
              Handpicked Collections
            </span>
            <h2 className="fw-bold mb-1">Stays for Every Travel Style</h2>
            <p className="text-muted">Whether traveling solo, with family, or for important business meetings</p>
          </div>

          <div className="row g-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="col-lg col-md-4 col-6">
                <div
                  className="p-3 bg-white border rounded-3 h-100 text-center shadow-sm"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => navigate(`/explore?${cat.query}`)}
                >
                  <div className="fs-1 mb-2">{cat.icon}</div>
                  <h6 className="fw-bold mb-1">{cat.title}</h6>
                  <p className="small text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                    {cat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Hotels */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-teal fw-bold small text-uppercase" style={{ color: '#0d9488' }}>
                Top Rated Properties
              </span>
              <h2 className="fw-bold mb-1">Featured Hotels Across India</h2>
              <p className="text-muted mb-0">Handpicked for exceptional comfort, stellar hospitality, and verified guest reviews</p>
            </div>
            <Link to="/explore" className="btn btn-outline-navy btn-sm d-none d-md-flex align-items-center gap-1">
              Explore All <RiArrowRightLine />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#0d9488' }} role="status"></div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredHotels.map((hotel) => (
                <div key={hotel._id} className="col-lg-4 col-md-6">
                  <HotelCard hotel={hotel} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Why Choose StaySphere */}
      <section className="py-5" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="badge-demo text-uppercase mb-2">Hospitality Excellence</span>
            <h2 className="fw-bold text-white mb-2">Why Discerning Guests Choose StaySphere</h2>
            <p className="text-light opacity-75 max-w-600 mx-auto">
              Engineered specifically for Indian travelers with localized amenities, transparent INR pricing, and seamless booking operations.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="p-4 rounded-3 h-100" style={{ backgroundColor: '#1e293b' }}>
                <div className="rounded p-2 d-inline-block mb-3" style={{ backgroundColor: 'rgba(13, 148, 136, 0.2)' }}>
                  <RiFlashlightLine size={28} style={{ color: '#0d9488' }} />
                </div>
                <h5 className="fw-bold text-white mb-2">Real-Time Availability</h5>
                <p className="small text-light opacity-75 mb-0">
                  Atomic backend room allocation prevents double bookings and guarantees that your confirmed room is locked immediately.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="p-4 rounded-3 h-100" style={{ backgroundColor: '#1e293b' }}>
                <div className="rounded p-2 d-inline-block mb-3" style={{ backgroundColor: 'rgba(13, 148, 136, 0.2)' }}>
                  <RiMoneyDollarCircleLine size={28} style={{ color: '#0d9488' }} />
                </div>
                <h5 className="fw-bold text-white mb-2">Transparent INR Pricing</h5>
                <p className="small text-light opacity-75 mb-0">
                  Zero hidden surprises. Every room rate shows clear base pricing, applicable discounts, and standard 12% GST breakdown.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="p-4 rounded-3 h-100" style={{ backgroundColor: '#1e293b' }}>
                <div className="rounded p-2 d-inline-block mb-3" style={{ backgroundColor: 'rgba(13, 148, 136, 0.2)' }}>
                  <RiShieldCheckLine size={28} style={{ color: '#0d9488' }} />
                </div>
                <h5 className="fw-bold text-white mb-2">100% Verified Reviews</h5>
                <p className="small text-light opacity-75 mb-0">
                  Only guests who have actually completed an eligible stay can submit reviews, keeping our ratings genuine and trustworthy.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="p-4 rounded-3 h-100" style={{ backgroundColor: '#1e293b' }}>
                <div className="rounded p-2 d-inline-block mb-3" style={{ backgroundColor: 'rgba(13, 148, 136, 0.2)' }}>
                  <RiCustomerService2Line size={28} style={{ color: '#0d9488' }} />
                </div>
                <h5 className="fw-bold text-white mb-2">Dedicated Hotel Desk</h5>
                <p className="small text-light opacity-75 mb-0">
                  Direct phone numbers and hotel policies readily accessible on every detail page and booking invoice for effortless coordination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How Booking Works */}
      <section className="py-5">
        <div className="container py-2">
          <div className="text-center mb-5">
            <span className="text-teal fw-bold small text-uppercase" style={{ color: '#0d9488' }}>
              Simple 4-Step Process
            </span>
            <h2 className="fw-bold mb-1">How Booking Works on StaySphere</h2>
            <p className="text-muted">From search to check-in in under 2 minutes</p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-lg-3 col-6">
              <div className="rounded-circle bg-light border d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px', fontSize: '1.4rem', fontWeight: 800, color: '#0d9488' }}>
                1
              </div>
              <h6 className="fw-bold">Search & Compare</h6>
              <p className="small text-muted mb-0">Choose destination, dates, and filter by star rating or price</p>
            </div>

            <div className="col-lg-3 col-6">
              <div className="rounded-circle bg-light border d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px', fontSize: '1.4rem', fontWeight: 800, color: '#0d9488' }}>
                2
              </div>
              <h6 className="fw-bold">Select Room Type</h6>
              <p className="small text-muted mb-0">Review capacity, bed types, amenities, and breakfast options</p>
            </div>

            <div className="col-lg-3 col-6">
              <div className="rounded-circle bg-light border d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px', fontSize: '1.4rem', fontWeight: 800, color: '#0d9488' }}>
                3
              </div>
              <h6 className="fw-bold">Safe Demo Checkout</h6>
              <p className="small text-muted mb-0">Enter guest details and complete simulated payment with zero risk</p>
            </div>

            <div className="col-lg-3 col-6">
              <div className="rounded-circle bg-light border d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px', fontSize: '1.4rem', fontWeight: 800, color: '#0d9488' }}>
                4
              </div>
              <h6 className="fw-bold">Instant Invoice</h6>
              <p className="small text-muted mb-0">Download printable receipt and manage reservation in My Bookings</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQs Accordion */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container py-2" style={{ maxWidth: '850px' }}>
          <div className="text-center mb-5">
            <span className="text-teal fw-bold small text-uppercase" style={{ color: '#0d9488' }}>
              Help Center
            </span>
            <h2 className="fw-bold mb-1">Frequently Asked Questions</h2>
            <p className="text-muted">Everything you need to know about booking with StaySphere</p>
          </div>

          <div className="accordion shadow-sm rounded-3 overflow-hidden border" id="staySphereFaq">
            {FAQS.map((faq, index) => (
              <div className="accordion-item" key={index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className={`accordion-button fw-semibold ${index !== 0 ? 'collapsed' : ''}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                    aria-expanded={index === 0}
                    aria-controls={`collapse${index}`}
                  >
                    {faq.q}
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                  aria-labelledby={`heading${index}`}
                  data-bs-parent="#staySphereFaq"
                >
                  <div className="accordion-body text-secondary" style={{ fontSize: '0.94rem', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
