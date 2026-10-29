import React from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/formatters';
import { RiStarFill, RiMapPinLine, RiArrowRightLine } from 'react-icons/ri';

export default function HotelCard({ hotel }) {
  if (!hotel) return null;

  const startingPrice = hotel.startingPricePaise || 199900;
  const rating = hotel.averageRating ? Number(hotel.averageRating).toFixed(1) : '4.3';
  const reviewsCount = hotel.reviewCount || 12;

  return (
    <div className="hotel-card">
      {/* Image container */}
      <div className="hotel-card-img-wrap">
        <img
          src={hotel.featuredImage || (hotel.images && hotel.images[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
          alt={hotel.name}
          className="hotel-card-img"
          loading="lazy"
        />
        {/* Star Badge */}
        <div className="position-absolute top-0 start-0 m-3">
          <span className="badge-star d-inline-flex align-items-center gap-1 shadow-sm">
            <RiStarFill size={13} /> {hotel.starCategory} Star
          </span>
        </div>
        {/* Hotel Type Badge */}
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge-tag text-uppercase">{hotel.hotelType || 'Hotel'}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        {/* Location & Rating */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <div className="small text-muted d-flex align-items-center gap-1">
            <RiMapPinLine className="text-secondary" />
            <span className="text-truncate" style={{ maxWidth: '170px' }}>
              {hotel.locality ? `${hotel.locality}, ` : ''}{hotel.city}
            </span>
          </div>
          <div className="d-flex align-items-center gap-1 small fw-bold" style={{ color: '#0f172a' }}>
            <span
              className="badge d-inline-flex align-items-center gap-1"
              style={{ backgroundColor: '#0d9488', color: '#fff', fontSize: '0.75rem' }}
            >
              ★ {rating}
            </span>
            <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>
              ({reviewsCount})
            </span>
          </div>
        </div>

        {/* Hotel Title */}
        <h5 className="fw-bold mb-2 text-truncate" title={hotel.name} style={{ fontSize: '1.1rem' }}>
          {hotel.name}
        </h5>

        {/* Key Amenities */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {(hotel.amenities || []).slice(0, 3).map((amenity, idx) => (
            <span
              key={idx}
              className="badge bg-light text-secondary border fw-normal"
              style={{ fontSize: '0.72rem' }}
            >
              {amenity}
            </span>
          ))}
          {(hotel.amenities || []).length > 3 && (
            <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: '0.72rem' }}>
              +{(hotel.amenities || []).length - 3} more
            </span>
          )}
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-end">
          <div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Starts from</div>
            <div className="d-flex align-baseline gap-1">
              <span className="price-tag">{formatINR(startingPrice)}</span>
              <span className="price-subtext">/ night</span>
            </div>
            <div className="text-muted" style={{ fontSize: '0.68rem' }}>+ 12% sample GST</div>
          </div>

          <Link
            to={`/hotels/${hotel.slug || hotel._id}`}
            className="btn btn-teal btn-sm d-flex align-items-center gap-1"
            style={{ borderRadius: '8px', padding: '0.45rem 0.85rem' }}
          >
            View Details <RiArrowRightLine size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
