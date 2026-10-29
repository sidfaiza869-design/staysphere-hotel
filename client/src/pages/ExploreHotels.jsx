import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import HotelCard from '../components/hotels/HotelCard';
import { INDIAN_CITIES, formatINR } from '../utils/formatters';
import {
  RiFilter3Line,
  RiSearchLine,
  RiRestartLine,
  RiStarFill,
  RiMapPinLine
} from 'react-icons/ri';

const HOTEL_TYPES = [
  { label: 'All Types', value: 'all' },
  { label: 'Luxury Stays', value: 'luxury' },
  { label: 'Standard Hotels', value: 'standard' },
  { label: 'Budget Stays', value: 'budget' },
  { label: 'Business Stays', value: 'business' },
  { label: 'Resorts & Retreats', value: 'resort' },
  { label: 'Heritage Mansions', value: 'heritage' },
  { label: 'Boutique Suites', value: 'boutique' }
];

const AMENITY_OPTIONS = [
  'Free Wi-Fi',
  'Swimming Pool',
  'Fitness Center',
  'Restaurant',
  'Free Parking',
  'Airport Shuttle',
  'Air Conditioning',
  'Room Service'
];

export default function ExploreHotels() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search parameters from URL
  const initialCity = searchParams.get('city') || 'All Cities';
  const initialSearch = searchParams.get('search') || '';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialStarCategory = searchParams.get('starCategory') || '';
  const initialHotelType = searchParams.get('hotelType') || 'all';
  const initialSort = searchParams.get('sort') || 'recommended';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [city, setCity] = useState(initialCity);
  const [keyword, setKeyword] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [selectedStars, setSelectedStars] = useState(
    initialStarCategory ? initialStarCategory.split(',').map(Number) : []
  );
  const [hotelType, setHotelType] = useState(initialHotelType);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [hotels, setHotels] = useState([]);
  const [pagination, setPagination] = useState({
    totalHotels: 0,
    totalPages: 1,
    currentPage: 1
  });
  const [loading, setLoading] = useState(true);

  // Sync state to URL and fetch hotels
  useEffect(() => {
    async function fetchHotels() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (city && city !== 'All Cities') query.append('city', city);
        if (keyword) query.append('search', keyword);
        if (minPrice) query.append('minPrice', minPrice);
        if (maxPrice) query.append('maxPrice', maxPrice);
        if (selectedStars.length > 0) query.append('starCategory', selectedStars.join(','));
        if (hotelType && hotelType !== 'all') query.append('hotelType', hotelType);
        if (selectedAmenities.length > 0) query.append('amenities', selectedAmenities.join(','));
        if (sort) query.append('sort', sort);
        query.append('page', page);
        query.append('limit', 9);

        // Update URL
        setSearchParams(query, { replace: true });

        const res = await api.get(`/hotels?${query.toString()}`);
        if (res.success) {
          setHotels(res.data?.hotels || []);
          setPagination(res.data?.pagination || { totalHotels: 0, totalPages: 1, currentPage: 1 });
        }
      } catch (err) {
        console.error('Error fetching hotels:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [city, keyword, minPrice, maxPrice, selectedStars, hotelType, selectedAmenities, sort, page]);

  const handleStarToggle = (star) => {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
    setPage(1);
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
    setPage(1);
  };

  const handleResetFilters = () => {
    setCity('All Cities');
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedStars([]);
    setHotelType('all');
    setSelectedAmenities([]);
    setSort('recommended');
    setPage(1);
  };

  return (
    <div className="py-4">
      <div className="container">
        {/* Breadcrumb & Title */}
        <div className="mb-4">
          <h1 className="fw-bold mb-1">
            {city && city !== 'All Cities' ? `Hotels in ${city}, India` : 'Explore Hotels Across India'}
          </h1>
          <p className="text-muted mb-0">
            {pagination.totalHotels} properties found with verified Indian amenities & transparent INR pricing
          </p>
        </div>

        <div className="row g-4">
          {/* Sidebar Filters */}
          <div className="col-lg-3">
            <div className="bg-white p-4 border rounded-3 shadow-sm sticky-top" style={{ top: '90px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <RiFilter3Line style={{ color: '#0d9488' }} /> Filters
                </h5>
                <button
                  onClick={handleResetFilters}
                  className="btn btn-sm btn-link text-decoration-none text-muted p-0 d-flex align-items-center gap-1"
                >
                  <RiRestartLine /> Reset
                </button>
              </div>

              {/* Keyword Search */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase text-muted">Keyword Search</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <RiSearchLine />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Hotel name, locality..."
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>

              {/* City Filter */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase text-muted">Destination City</label>
                <select
                  className="form-select form-select-sm"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase text-muted">Price Range (₹ / night)</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Min ₹"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Max ₹"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Star Category */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase text-muted">Star Category</label>
                <div className="d-flex flex-column gap-1">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div className="form-check" key={star}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`star-${star}`}
                        checked={selectedStars.includes(star)}
                        onChange={() => handleStarToggle(star)}
                      />
                      <label className="form-check-label small d-flex align-items-center gap-1" htmlFor={`star-${star}`}>
                        {star} Stars <RiStarFill className="text-warning" size={12} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotel Type */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase text-muted">Property Category</label>
                <select
                  className="form-select form-select-sm"
                  value={hotelType}
                  onChange={(e) => {
                    setHotelType(e.target.value);
                    setPage(1);
                  }}
                >
                  {HOTEL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amenities */}
              <div>
                <label className="form-label small fw-bold text-uppercase text-muted">Key Amenities</label>
                <div className="d-flex flex-column gap-1">
                  {AMENITY_OPTIONS.map((amenity) => (
                    <div className="form-check" key={amenity}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                      />
                      <label className="form-check-label small text-secondary" htmlFor={`amenity-${amenity}`}>
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="col-lg-9">
            {/* Sorting Bar */}
            <div className="bg-white p-3 border rounded-3 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 shadow-sm">
              <div className="small text-muted">
                Showing <strong className="text-dark">{hotels.length}</strong> of{' '}
                <strong className="text-dark">{pagination.totalHotels}</strong> stays
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted text-nowrap">Sort By:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '190px' }}
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Guest Rating</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-teal" style={{ color: '#0d9488' }} role="status"></div>
                <div className="mt-2 text-muted small">Loading hotels...</div>
              </div>
            ) : hotels.length === 0 ? (
              /* Empty state */
              <div className="bg-white p-5 border rounded-3 text-center my-4">
                <div className="fs-1 mb-3">🏨🔍</div>
                <h4 className="fw-bold">No hotels matched your search</h4>
                <p className="text-muted max-w-500 mx-auto mb-4">
                  We couldn't find any properties matching the selected filters. Try broadening your price range or choosing a different Indian city.
                </p>
                <button onClick={handleResetFilters} className="btn btn-teal">
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Cards Grid */
              <>
                <div className="row g-4">
                  {hotels.map((hotel) => (
                    <div key={hotel._id} className="col-lg-4 col-md-6">
                      <HotelCard hotel={hotel} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-5">
                    <nav aria-label="Page navigation">
                      <ul className="pagination">
                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                          >
                            Previous
                          </button>
                        </li>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                          <li
                            key={p}
                            className={`page-item ${pagination.currentPage === p ? 'active' : ''}`}
                          >
                            <button className="page-link" onClick={() => setPage(p)}>
                              {p}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            pagination.currentPage === pagination.totalPages ? 'disabled' : ''
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
