import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatINR } from '../utils/formatters';
import { RiMapPinLine, RiSearchLine } from 'react-icons/ri';

export default function Destinations() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const res = await api.get('/hotels/destinations');
        if (res.success) {
          setDestinations(res.data?.destinations || []);
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDestinations();
  }, []);

  const filtered = destinations.filter(
    (d) =>
      d.city.toLowerCase().includes(search.toLowerCase()) ||
      d.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-5">
      <div className="container">
        <div className="text-center mb-5" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <span className="badge-demo text-uppercase mb-2">Explore Incredible India</span>
          <h1 className="fw-bold mb-2">Discover Stays Across 18+ Indian Cities</h1>
          <p className="text-muted mb-4">
            From the bustling economic hubs of Mumbai & Indore to spiritual Varanasi and tranquil hill retreats in Manali & Shimla.
          </p>

          <div className="input-group shadow-sm" style={{ maxWidth: '420px', margin: '0 auto' }}>
            <span className="input-group-text bg-white border-end-0">
              <RiSearchLine />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by city or state name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#0d9488' }} role="status"></div>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map((dest) => (
              <div key={dest.city} className="col-lg-4 col-md-6">
                <div
                  className="dest-card"
                  onClick={() => navigate(`/explore?city=${encodeURIComponent(dest.city)}`)}
                >
                  <img src={dest.image} alt={dest.city} loading="lazy" />
                  <div className="dest-overlay">
                    <div className="badge bg-white text-dark align-self-start mb-2 fw-semibold px-2 py-1 small">
                      {dest.hotelCount} {dest.hotelCount === 1 ? 'Property' : 'Properties'}
                    </div>
                    <h3 className="fw-bold mb-0 text-white">{dest.city}</h3>
                    <p className="small mb-2 text-light opacity-75">{dest.state}</p>
                    <div className="small fw-semibold" style={{ color: '#5eead4' }}>
                      Stays starting from {formatINR(dest.startingPricePaise)} / night
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
