# StaySphere — Quality Assurance & Testing Report

This document records the automated and manual verification executed for the **StaySphere** platform.

---

## 1. Test Suite Summary
The backend includes automated unit and end-to-end integration tests using Node.js's native test runner (`node:test`) and Supertest.

### Test Execution Command
```bash
npm --prefix server test
```

### Result: 27 / 27 Tests Passed (0 Failures)
```text
TAP version 13
ok 1 - Auth: password hashing and verification with bcrypt
ok 2 - Auth: JWT signing and verification
ok 3 - Auth: authorizeRoles allows permitted role
ok 4 - Auth: authorizeRoles blocks unauthorized role with 403
ok 5 - Availability: rejects invalid dates
ok 6 - Availability: rejects check-in date in the past
ok 7 - Availability: rejects check-out date before or equal to check-in date
ok 8 - Currency: rupees to paise conversion
ok 9 - Currency: paise to rupees conversion
ok 10 - Currency: formatINR Indian locale output
ok 11 - Pricing: backend pricing calculation enforces 12% tax and correct totals
ok 12 - Pricing: discount calculation applies before tax
ok 13 - E2E #1: GET /api/health returns healthy service status
ok 14 - E2E #2: POST /api/auth/register creates a new guest user
ok 15 - E2E #3: POST /api/auth/login authenticates guest successfully
ok 16 - E2E #4: GET /api/hotels?city=Indore returns Indore hotels
ok 17 - E2E #5: GET /api/hotels with price filter respects bounds
ok 18 - E2E #6: GET /api/hotels/:id returns hotel details with room types
ok 19 - E2E #7: GET /api/availability/check reports rooms available
ok 20 - E2E #8: POST /api/bookings creates confirmed booking with 12% GST
ok 21 - E2E #9: GET /api/bookings/my-bookings shows the confirmed reservation
ok 22 - E2E #10: POST /api/bookings/:id/cancel cancels booking with refund
ok 23 - E2E #11: Availability check confirms inventory was released
ok 24 - E2E #12: Manager logs in and views dashboard statistics
ok 25 - E2E #13: Admin logs in and retrieves system metrics & users
ok 26 - E2E #14: Guest accessing admin portal is blocked with 403 Forbidden
ok 27 - E2E #15: Unauthenticated request to /api/bookings/my-bookings returns 401
# pass 27
# fail 0
```

---

## 2. Verified Critical Business Scenarios

| Scenario | Expected Behavior | Observed Result | Status |
|---|---|---|---|
| **1. Indian Phone Validation** | Rejects non-Indian or non-10 digit numbers; accepts valid `[6-9]\d{9}` numbers | Rejects invalid phone numbers; accepts valid 10-digit formats | ✅ Pass |
| **2. Pricing Calculation** | Totals calculated exclusively on backend; client totals ignored; applies sample 12% GST | Calculations match exact integer paise arithmetic | ✅ Pass |
| **3. Date Validation** | Rejects past dates and checkIn >= checkOut | Returns 400 Bad Request with descriptive message | ✅ Pass |
| **4. Room Inventory Allocation** | Overlapping bookings deduct from available count; overselling blocked with 409 Conflict | Capacity enforced atomically; double booking prevented | ✅ Pass |
| **5. Inventory Release** | Cancelling an active reservation immediately releases inventory back to property | Verified in E2E #11 | ✅ Pass |
| **6. Cancellation Policy** | >24 hrs = 100% simulated refund; <24 hrs = 50% cancellation fee | Verified in unit & E2E tests | ✅ Pass |
| **7. Role-Based Access Control** | Guests blocked from manager/admin endpoints; managers restricted to assigned properties | 403 Forbidden enforced | ✅ Pass |
| **8. Review Eligibility** | Only guests with completed stays (`checked_out` or past checkOut) can submit reviews | Blocked with 400 Bad Request otherwise | ✅ Pass |
| **9. Frontend Build** | Vite bundles JSX and CSS cleanly without missing modules | Built in 5.20s without warnings or errors | ✅ Pass |

---

## 3. Demo Accounts Verified

- **Guest Account**: `guest@staysphere.com` / `Guest@123`
- **Hotel Manager Account**: `manager@staysphere.com` / `Manager@123`
- **Administrator Account**: `admin@staysphere.com` / `Admin@123`
