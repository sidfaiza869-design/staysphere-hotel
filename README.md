# StaySphere — Hotel Booking & Management Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-brightgreen.svg)](https://mongoosejs.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/UI-Bootstrap%205%20%2B%20Custom%20CSS-7952b3.svg)](https://getbootstrap.com/)
[![Tests](https://img.shields.io/badge/Tests-27%20Passed-success.svg)](./docs/TESTING.md)

> **"Find Your Stay. Feel at Home."**  
> A production-style hotel booking and operations management web platform designed specifically for the Indian hospitality market.

---

## 🌟 Key Features

### 🏨 Guest Experience & Discovery
- **Indian Destinations**: Curated listings across 18+ Indian destinations (Indore, Bhopal, Mumbai, Pune, Delhi, Jaipur, Udaipur, Goa, Bengaluru, Hyderabad, Chennai, Kolkata, Varanasi, Agra, Kochi, Shimla, Manali, Rishikesh).
- **Interactive Search & Filter**: Filter by city, check-in/out dates, price range, star rating (1–5 stars), property categories (luxury, standard, budget, business, resort, heritage, boutique), and amenities.
- **Dynamic Hotel Details**: High-resolution galleries, amenities breakdown, house rules, check-in/out timings, contact details, and verified reviews.
- **Real-Time Room Inventory**: Live backend availability checks that prevent overbooking and double booking.
- **Indian Rupee (INR) Pricing**: `en-IN` currency formatting (`₹2,499 / night`) with transparent itemized invoices, including a sample configurable 12% GST breakdown (6% CGST + 6% SGST).
- **Safe Simulated Checkout**: Complete 4-step reservation workflow with instant simulated UPI / NetBanking / Card payments without entering real bank credentials.
- **Printable Booking Receipts**: Detailed voucher with unique booking references (`SS-IN-XXXX-XXXX`), hotel contact numbers, and check-in instructions.
- **My Bookings Dashboard**: Manage upcoming, completed, and cancelled reservations.
- **Cancellation & Refunds**: Automatic cancellation policy calculation (>24 hours = 100% simulated refund; <24 hours = 50% cancellation fee) with instant inventory release.
- **Verified Reviews**: Only guests with completed, verified stays can post reviews and ratings.

### 💼 Hotel Manager Dashboard
- **Operational Metrics**: Total properties, total rooms, today’s arrivals, today’s departures, active reservations, occupancy rate %, and verified revenue.
- **Property Management**: View managed properties and add new room types with nightly rates, inventories, and bed configurations.
- **Reservation Management**: Search guest reservations, filter by status, check guests in, check guests out, and cancel reservations.
- **Strict Authorization**: Managers can only view and manage their assigned properties.

### 🛡️ Administrator Dashboard
- **Platform Analytics**: Total users, total hotels, room types, verified revenue, and Recharts visual graphs for booking trends and destination popularity.
- **User Governance**: View registered users, update roles (`guest`, `manager`, `admin`), and suspend or activate accounts.
- **Property Governance**: Approve or reject newly submitted hotel listings.

---

## 🏗️ Technology Stack

### Frontend
- **React.js 18** with **Vite**
- **React Router DOM v6** (client-side routing & protected routes)
- **Bootstrap 5** & Custom Hospitality Design System (Deep navy `#0f172a`, Emerald teal `#0d9488`, Warm white `#fcfbf9`)
- **Axios** (HTTP client with interceptors and cookie support)
- **React Hot Toast** (Toast notifications)
- **Recharts** (Admin analytics and booking charts)
- **React Icons** (Remix icon set)

### Backend
- **Node.js** & **Express.js** RESTful API
- **MongoDB** with **Mongoose ODM**
- **JWT (JSON Web Tokens)** & **HTTP-only Cookies**
- **bcryptjs** (Password hashing)
- **express-validator** (Request input validation)
- **Helmet** & **CORS** (Security headers and cross-origin resource sharing)
- **express-rate-limit** (Brute-force protection for auth endpoints)
- **Native Node.js Test Runner** (`node:test`) & **Supertest**

---

## 📁 Project Structure

```
StaySphere/
├── client/                     # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # ProtectedRoute, Modals
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   └── hotels/         # HotelCard, SearchBar
│   │   ├── context/            # AuthContext (state, login, register, logout)
│   │   ├── pages/              # Home, ExploreHotels, HotelDetails, Checkout,
│   │   │                       # Confirmation, MyBookings, Profile, Manager, Admin
│   │   ├── services/           # Axios API instance
│   │   ├── utils/              # formatINR, formatDate, Indian cities list
│   │   ├── App.jsx             # Router and layout configuration
│   │   ├── index.css           # Design tokens, typography & components
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── server/                     # Express.js Backend API
│   ├── config/                 # db.js (MongoDB Atlas, Local & MongoMemoryServer)
│   ├── controllers/            # auth, hotel, room, availability, booking, review, manager, admin
│   ├── middleware/             # auth (JWT & cookies), errorHandler, validators
│   ├── models/                 # User, Hotel, RoomType, Booking, Payment, Review
│   ├── routes/                 # Express API routes
│   ├── scripts/                # seed.js (20 fictional demonstration hotels across India)
│   ├── services/               # availabilityService, paymentService
│   ├── tests/                  # automated unit & E2E integration tests
│   ├── utils/                  # currency.js (paise arithmetic & GST calculation)
│   ├── app.js                  # Express application setup
│   ├── server.js               # Server entry point
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── API.md                  # Complete REST API documentation
│   └── TESTING.md              # Quality assurance and test execution report
├── .gitignore
├── package.json                # Root monorepo orchestration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended; v20.x tested)
- **npm** (v9 or higher)
- **MongoDB** (Supports local MongoDB, MongoDB Atlas connection string, or embedded MongoMemoryServer)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd StaySphere
   ```

2. **Install all dependencies:**
   ```bash
   # Install root orchestration
   npm install

   # Install server dependencies
   npm --prefix server install

   # Install client dependencies
   npm --prefix client install
   ```

3. **Configure Environment Variables:**
   - Server: copy `server/.env.example` to `server/.env`
     ```bash
     PORT=5000
     NODE_ENV=development
     MONGODB_URI=
     JWT_SECRET=staysphere_super_secret_jwt_key_for_development_only_2026
     JWT_EXPIRES_IN=7d
     CLIENT_URL=http://localhost:5173
     TAX_RATE_PERCENT=12
     PAYMENT_PROVIDER=demo
     ```
     > **Note:** If `MONGODB_URI` is left blank or cannot be reached locally, StaySphere automatically falls back to an embedded in-memory MongoDB instance for zero-configuration local execution!
   - Client: copy `client/.env.example` to `client/.env`
     ```bash
     VITE_API_BASE_URL=http://localhost:5000/api
     ```

4. **Seed Demonstration Hotel Data:**
   Populate 20 hotels across 18 Indian cities, room types, and demo accounts:
   ```bash
   npm run seed
   # or
   npm --prefix server run seed
   ```

---

## 🏃 Running the Application

### Option A: Run Both Client & Server Concurrently (Recommended)
```bash
npm run dev
```

### Option B: Run Services Separately
- **Backend API Server**:
  ```bash
  npm run server
  # Server will run at http://localhost:5000
  ```
- **Frontend Client**:
  ```bash
  npm run client
  # Client will run at http://localhost:5173
  ```

Open your browser at `http://localhost:5173`.

---

## 👥 Demo Accounts

The seed script creates three ready-to-test accounts (with 1-click test buttons on the login page):

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Guest** | `guest@staysphere.com` | `Guest@123` | Search, book stays, manage reservations, write verified reviews |
| **Hotel Manager** | `manager@staysphere.com` | `Manager@123` | Manager portal, view assigned properties, manage rooms, check-in/out |
| **Administrator** | `admin@staysphere.com` | `Admin@123` | Full admin portal, revenue charts, user governance, hotel approvals |

---

## 🧪 Running Automated Tests

Run the 27 automated unit and end-to-end integration tests:
```bash
npm run test:server
# or
npm --prefix server test
```

All 27 tests verify:
- Currency and paise conversions
- Backend 12% sample GST tax calculation and discount order
- Check-in and check-out date validation
- Password hashing and JWT generation
- Guest registration and login
- Hotel search and price filtering
- Atomic room inventory allocation & release
- Cancellation and refund policy calculations
- Manager and administrator RBAC authorization

---

## 💳 Payment Simulation & Razorpay Integration

- **Default Mode (`PAYMENT_PROVIDER=demo`)**:
  Simulates verified UPI, RuPay/Visa Debit Cards, and NetBanking transactions with unique IDs (`DEMO_TXN_...`). Clearly labeled as a demonstration mode; no real money is deducted.
- **Razorpay Test Mode (`PAYMENT_PROVIDER=razorpay`)**:
  Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env` to create server-verified orders and validate payment signatures.

---

## 🚢 Deployment Guide

### Backend (Render / Railway / AWS / DigitalOcean)
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `MONGODB_URI=<your-mongodb-atlas-connection-string>`
  - `JWT_SECRET=<strong-random-secret>`
  - `CLIENT_URL=https://<your-frontend-domain>`
  - `TAX_RATE_PERCENT=12`
  - `PAYMENT_PROVIDER=demo`

### Frontend (Vercel / Netlify)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL=https://<your-backend-domain>/api`
- **SPA Rewrite Rule**:
  Configure a rewrite rule for client-side routing (e.g. `/*` -> `/index.html` on Netlify or `vercel.json` rewrites).

---

## 🔒 Security Measures
- **Passwords**: Hashed with `bcryptjs` (salt rounds: 10); never returned in queries (`select: false`).
- **Tokens**: JSON Web Tokens delivered in HTTP-only, secure cookies with fallback to Bearer header.
- **Rate Limiting**: `express-rate-limit` prevents brute-force attacks on `/api/auth/login` and `/api/auth/register`.
- **Headers**: `helmet` configured for modern HTTP security headers.
- **Validation**: Strict input validation using `express-validator` on all payload endpoints.
- **Data Isolation**: Guests can only view and cancel their own bookings; managers can only manage assigned hotels.

---

## 📄 License
This project is licensed under the MIT License.
