import React from 'react';
import { Link } from 'react-router-dom';
import { RiHomeLine, RiCompass3Line } from 'react-icons/ri';

export default function NotFound() {
  return (
    <div className="container py-5 text-center" style={{ minHeight: '65vh' }}>
      <div className="py-5" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="display-1 fw-bold text-teal mb-3" style={{ color: '#0d9488' }}>
          404
        </div>
        <h2 className="fw-bold mb-2">Page Not Found</h2>
        <p className="text-muted mb-4">
          The hotel property, page, or reservation URL you are looking for does not exist or has been relocated.
        </p>

        <div className="d-flex justify-content-center gap-2">
          <Link to="/" className="btn btn-primary-navy d-flex align-items-center gap-1">
            <RiHomeLine /> Return Home
          </Link>
          <Link to="/explore" className="btn btn-teal d-flex align-items-center gap-1">
            <RiCompass3Line /> Explore Hotels
          </Link>
        </div>
      </div>
    </div>
  );
}
