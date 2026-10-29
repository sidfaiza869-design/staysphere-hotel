const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

let guestToken = '';
let guestCookie = '';
let managerToken = '';
let adminToken = '';
let testHotelId = '';
let testRoomId = '';
let createdBookingId = '';
let createdBookingRef = '';

test.before(async () => {
  // Ensure DB connected
  await connectDB();

  // Clear test DB
  await Promise.all([
    User.deleteMany({}),
    Hotel.deleteMany({}),
    RoomType.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Review.deleteMany({})
  ]);

  // Seed demo manager and admin
  const manager = await User.create({
    name: 'Priya Verma',
    email: 'manager@staysphere.com',
    phone: '9826012345',
    password: 'Manager@123',
    role: 'manager',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pinCode: '452010'
  });

  const admin = await User.create({
    name: 'StaySphere Admin',
    email: 'admin@staysphere.com',
    phone: '9893011223',
    password: 'Admin@123',
    role: 'admin',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pinCode: '462002'
  });

  // Seed a test hotel in Indore assigned to this manager
  const hotel = await Hotel.create({
    name: 'Central Comfort Inn',
    city: 'Indore',
    state: 'Madhya Pradesh',
    locality: 'Vijay Nagar',
    address: 'Scheme 54, Vijay Nagar',
    pinCode: '452010',
    starCategory: 4,
    hotelType: 'business',
    startingPricePaise: 249900,
    description: 'Premier business hotel in Indore with high speed Wi-Fi and pool.',
    managers: [manager._id],
    approvalStatus: 'approved',
    isActive: true
  });
  testHotelId = hotel._id.toString();

  manager.managedHotels.push(hotel._id);
  await manager.save();

  // Seed test room type
  const room = await RoomType.create({
    hotel: hotel._id,
    name: 'Deluxe City View',
    totalInventory: 5,
    pricePerNightPaise: 249900,
    bedConfiguration: '1 King Bed',
    breakfastIncluded: true,
    isActive: true
  });
  testRoomId = room._id.toString();
});

test.after(async () => {
  await disconnectDB();
});

// Scenario 1: Health check
test('E2E #1: GET /api/health returns healthy service status', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'healthy');
  assert.strictEqual(res.body.service, 'StaySphere API');
});

// Scenario 2: Register a new guest
test('E2E #2: POST /api/auth/register creates a new guest user', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Ananya Sharma',
      email: 'ananya@staysphere.com',
      phone: '9876543210',
      password: 'GuestPassword@123',
      confirmPassword: 'GuestPassword@123',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pinCode: '452010',
      termsAccepted: true
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.user.email, 'ananya@staysphere.com');
  assert.strictEqual(res.body.data.user.role, 'guest');
  assert.ok(res.body.token);

  guestToken = res.body.token;
  const setCookie = res.headers['set-cookie'];
  if (setCookie) {
    guestCookie = setCookie[0];
  }
});

// Scenario 3: Log in as guest
test('E2E #3: POST /api/auth/login authenticates guest successfully', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'ananya@staysphere.com',
      password: 'GuestPassword@123'
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.user.name, 'Ananya Sharma');
  guestToken = res.body.token;
});

// Scenario 4: Search hotels in Indore
test('E2E #4: GET /api/hotels?city=Indore returns Indore hotels', async () => {
  const res = await request(app).get('/api/hotels?city=Indore');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.hotels.length >= 1);
  assert.strictEqual(res.body.data.hotels[0].city, 'Indore');
});

// Scenario 5: Filter hotels by price
test('E2E #5: GET /api/hotels with price filter respects bounds', async () => {
  const res = await request(app).get('/api/hotels?minPrice=2000&maxPrice=3000');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  res.body.data.hotels.forEach((h) => {
    assert.ok(h.startingPricePaise >= 200000);
    assert.ok(h.startingPricePaise <= 300000);
  });
});

// Scenario 6: Open hotel detail page
test('E2E #6: GET /api/hotels/:id returns hotel details with room types', async () => {
  const res = await request(app).get(`/api/hotels/${testHotelId}`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.hotel.name, 'Central Comfort Inn');
  assert.ok(res.body.data.roomTypes.length >= 1);
});

// Scenario 7: Check room availability for future dates
test('E2E #7: GET /api/availability/check reports rooms available', async () => {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 5);
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 7);

  const res = await request(app).get(
    `/api/availability/check?roomTypeId=${testRoomId}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}&rooms=1`
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.isAvailable, true);
  assert.strictEqual(res.body.data.availableRooms, 5);
});

// Scenario 8: Complete demo booking workflow
test('E2E #8: POST /api/bookings creates confirmed booking with 12% GST', async () => {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 5);
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 7);

  const res = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${guestToken}`)
    .send({
      hotelId: testHotelId,
      roomTypeId: testRoomId,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      numberOfRooms: 1,
      numberOfGuests: { adults: 2, children: 0 },
      guestDetails: {
        fullName: 'Ananya Sharma',
        email: 'ananya@staysphere.com',
        phone: '9876543210',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pinCode: '452010',
        specialRequests: 'Near elevator please'
      },
      paymentMethod: 'UPI — GooglePay / PhonePe (Simulated Demo)'
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.booking.bookingStatus, 'confirmed');
  assert.strictEqual(res.body.data.booking.paymentStatus, 'paid');
  assert.strictEqual(res.body.data.booking.pricing.taxRatePercent, 12);
  assert.ok(res.body.data.booking.bookingReference.startsWith('SS-IN-'));

  createdBookingId = res.body.data.booking._id;
  createdBookingRef = res.body.data.booking.bookingReference;
});

// Scenario 9: Verify booking appears in My Bookings
test('E2E #9: GET /api/bookings/my-bookings shows the confirmed reservation', async () => {
  const res = await request(app)
    .get('/api/bookings/my-bookings')
    .set('Authorization', `Bearer ${guestToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.upcoming.length >= 1);
  assert.strictEqual(res.body.data.upcoming[0].bookingReference, createdBookingRef);
});

// Scenario 10: Cancel eligible reservation and verify refund calculation
test('E2E #10: POST /api/bookings/:id/cancel cancels booking with refund', async () => {
  const res = await request(app)
    .post(`/api/bookings/${createdBookingId}/cancel`)
    .set('Authorization', `Bearer ${guestToken}`)
    .send({
      reason: 'Trip rescheduled'
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.booking.bookingStatus, 'cancelled');
  assert.strictEqual(res.body.data.cancellationDetails.refundStatus, 'processed');
});

// Scenario 11: Confirm inventory released back after cancellation
test('E2E #11: Availability check confirms inventory was released', async () => {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 5);
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 7);

  const res = await request(app).get(
    `/api/availability/check?roomTypeId=${testRoomId}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}&rooms=1`
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.availableRooms, 5); // All 5 rooms available again!
});

// Scenario 12: Manager portal authentication and stats
test('E2E #12: Manager logs in and views dashboard statistics', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'manager@staysphere.com',
      password: 'Manager@123'
    });

  assert.strictEqual(loginRes.status, 200);
  managerToken = loginRes.body.token;

  const statsRes = await request(app)
    .get('/api/manager/stats')
    .set('Authorization', `Bearer ${managerToken}`);

  assert.strictEqual(statsRes.status, 200);
  assert.strictEqual(statsRes.body.success, true);
  assert.strictEqual(statsRes.body.data.totalProperties, 1);
});

// Scenario 13: Admin portal authentication and system overview
test('E2E #13: Admin logs in and retrieves system metrics & users', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@staysphere.com',
      password: 'Admin@123'
    });

  assert.strictEqual(loginRes.status, 200);
  adminToken = loginRes.body.token;

  const statsRes = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(statsRes.status, 200);
  assert.strictEqual(statsRes.body.success, true);
  assert.ok(statsRes.body.data.users.total >= 3);
  assert.ok(statsRes.body.data.hotels.total >= 1);
});

// Scenario 14: Security check - unauthorized role access rejected with 403
test('E2E #14: Guest accessing admin portal is blocked with 403 Forbidden', async () => {
  const res = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${guestToken}`);

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// Scenario 15: Security check - unauthenticated access rejected with 401
test('E2E #15: Unauthenticated request to /api/bookings/my-bookings returns 401', async () => {
  const res = await request(app).get('/api/bookings/my-bookings');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});
