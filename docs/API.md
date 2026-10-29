# StaySphere — RESTful API Documentation

## Base URL
- Local: `http://localhost:5000/api`
- Content-Type: `application/json`
- Authentication: Secure HTTP-only cookies (`token`) or `Authorization: Bearer <token>`

---

## 1. System Health
### `GET /api/health`
Check service health and database connection status.
- **Access**: Public
- **Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-29T15:43:12.658Z",
  "service": "StaySphere API",
  "version": "1.0.0",
  "database": "connected",
  "environment": "development"
}
```

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
Register a new guest or hotel manager account.
- **Access**: Public
- **Body**:
```json
{
  "name": "Ananya Sharma",
  "email": "ananya@example.com",
  "phone": "9876543210",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "role": "guest",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "pinCode": "452010",
  "termsAccepted": true
}
```

### `POST /api/auth/login`
Authenticate user, returns JWT and sets HTTP-only cookie.
- **Access**: Public
- **Body**:
```json
{
  "email": "guest@staysphere.com",
  "password": "Guest@123"
}
```

### `POST /api/auth/logout`
Clears session cookie.
- **Access**: Public

### `GET /api/auth/me`
Retrieve currently authenticated profile.
- **Access**: Authenticated

### `PUT /api/auth/profile`
Update user contact information.
- **Access**: Authenticated

### `PUT /api/auth/change-password`
Change security password.
- **Access**: Authenticated

---

## 3. Hotels (`/api/hotels`)

### `GET /api/hotels`
Search and filter hotels across India.
- **Access**: Public
- **Query Parameters**:
  - `city`: Destination name (e.g. `Indore`, `Bhopal`, `Goa`, `Mumbai`)
  - `search`: Keyword matching name, city, locality, description
  - `minPrice`: Minimum nightly rate in INR
  - `maxPrice`: Maximum nightly rate in INR
  - `starCategory`: Comma-separated star ratings (e.g. `3,4,5`)
  - `hotelType`: Property style (`budget`, `standard`, `luxury`, `business`, `resort`, `heritage`, `boutique`)
  - `amenities`: Filter by required amenities
  - `sort`: `price_asc`, `price_desc`, `rating`, `popular`, `recommended`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 12)

### `GET /api/hotels/featured`
Returns top-rated featured stays for the homepage.
- **Access**: Public

### `GET /api/hotels/destinations`
Returns Indian cities with active hotel counts, starting rates, and preview images.
- **Access**: Public

### `GET /api/hotels/:identifier`
Retrieve single hotel details by slug or ObjectId, with populated room types and approved reviews.
- **Access**: Public

### `POST /api/hotels`
Create a new hotel property listing.
- **Access**: Manager or Admin

### `PUT /api/hotels/:id`
Update hotel property details.
- **Access**: Assigned Manager or Admin

### `PATCH /api/hotels/:id/status`
Toggle active/inactive state of hotel.
- **Access**: Assigned Manager or Admin

---

## 4. Room Types & Inventory (`/api/rooms`)

### `GET /api/rooms/hotel/:hotelId`
Get all room types for a property.
- **Access**: Public

### `POST /api/rooms`
Create a new room type with inventory and INR paise rate.
- **Access**: Assigned Manager or Admin
- **Body**:
```json
{
  "hotelId": "<hotelId>",
  "name": "Executive Balcony Suite",
  "pricePerNightPaise": 349900,
  "totalInventory": 5,
  "bedConfiguration": "1 King Bed",
  "roomSizeSqFt": 420,
  "breakfastIncluded": true,
  "freeCancellation": true
}
```

### `PUT /api/rooms/:id`
Update room type details.
- **Access**: Assigned Manager or Admin

### `DELETE /api/rooms/:id`
Deactivate room type.
- **Access**: Assigned Manager or Admin

---

## 5. Availability Engine (`/api/availability`)

### `GET /api/availability/check`
Check real-time availability for a room type between checkIn and checkOut dates.
- **Access**: Public
- **Query Parameters**:
  - `roomTypeId`: ID of room type
  - `checkIn`: ISO date string
  - `checkOut`: ISO date string
  - `rooms`: Number of rooms requested (default: 1)
- **Response**:
```json
{
  "success": true,
  "data": {
    "roomTypeId": "...",
    "totalInventory": 5,
    "occupiedRooms": 1,
    "availableRooms": 4,
    "requestedRooms": 1,
    "isAvailable": true,
    "pricePerNightPaise": 249900
  }
}
```

### `GET /api/availability/hotel/:hotelId`
Get availability for all active room types of a hotel.
- **Access**: Public

---

## 6. Bookings & Reservations (`/api/bookings`)

### `POST /api/bookings`
Create a confirmed reservation with atomic room availability check and demo payment processing.
- **Access**: Authenticated Guest
- **Body**:
```json
{
  "hotelId": "<hotelId>",
  "roomTypeId": "<roomTypeId>",
  "checkInDate": "2026-11-05T00:00:00.000Z",
  "checkOutDate": "2026-11-07T00:00:00.000Z",
  "numberOfRooms": 1,
  "numberOfGuests": { "adults": 2, "children": 0 },
  "guestDetails": {
    "fullName": "Ananya Sharma",
    "email": "ananya@example.com",
    "phone": "9876543210",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "pinCode": "452010",
    "specialRequests": "Upper floor room"
  },
  "paymentMethod": "UPI — GooglePay / PhonePe (Simulated Demo)"
}
```

### `GET /api/bookings/my-bookings`
Retrieve guest reservations organized into upcoming, past, and cancelled.
- **Access**: Authenticated Guest

### `GET /api/bookings/:identifier`
Retrieve single booking voucher by booking reference (e.g. `SS-IN-2610-A9F4`) or ObjectId.
- **Access**: Booking Guest, Assigned Manager, or Admin

### `POST /api/bookings/:id/cancel`
Cancel an eligible reservation with refund calculation and instant inventory release.
- **Access**: Booking Guest or Admin
- **Body**:
```json
{
  "reason": "Trip schedule changed"
}
```

---

## 7. Verified Reviews (`/api/reviews`)

### `GET /api/reviews/hotel/:hotelId`
Get approved verified reviews for a property.
- **Access**: Public

### `POST /api/reviews`
Submit a verified stay review (only guests with eligible completed stays).
- **Access**: Authenticated Guest
- **Body**:
```json
{
  "bookingId": "<bookingId>",
  "rating": 5,
  "title": "Outstanding hospitality",
  "comment": "The location in Vijay Nagar was ideal and the breakfast spread was top-notch."
}
```

### `PATCH /api/reviews/:id/moderate`
Approve or reject a review.
- **Access**: Admin

---

## 8. Manager Portal (`/api/manager`)
- `GET /api/manager/stats`: Overview metrics, occupancy %, arrivals, departures, revenue
- `GET /api/manager/properties`: Assigned properties list
- `GET /api/manager/reservations`: Filterable reservations list
- `PATCH /api/manager/reservations/:id/status`: Check-in, check-out, or cancel reservation

---

## 9. Admin Portal (`/api/admin`)
- `GET /api/admin/stats`: System metrics, booking & revenue trends, destination analytics
- `GET /api/admin/users`: User directory with search and role filter
- `PATCH /api/admin/users/:id/role`: Update user role (`guest`, `manager`, `admin`)
- `PATCH /api/admin/users/:id/status`: Toggle user account status (`active`, `suspended`)
- `GET /api/admin/hotels`: All hotels list with approval status
- `PATCH /api/admin/hotels/:id/approval`: Approve or reject hotel listing (`approved`, `rejected`)
- `POST /api/admin/hotels/:id/assign-manager`: Assign manager to property
