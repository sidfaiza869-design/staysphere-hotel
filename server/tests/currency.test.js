const test = require('node:test');
const assert = require('node:assert');
const {
  rupeesToPaise,
  paiseToRupees,
  formatINR,
  calculateBookingPricing
} = require('../utils/currency');

test('Currency: rupees to paise conversion', () => {
  assert.strictEqual(rupeesToPaise(2499), 249900);
  assert.strictEqual(rupeesToPaise(1799.5), 179950);
});

test('Currency: paise to rupees conversion', () => {
  assert.strictEqual(paiseToRupees(249900), 2499);
  assert.strictEqual(paiseToRupees(179950), 1799.5);
});

test('Currency: formatINR Indian locale output', () => {
  const formatted = formatINR(249900);
  assert.ok(formatted.includes('2,499') || formatted.includes('2499'));
});

test('Pricing: backend pricing calculation enforces 12% tax and correct totals', () => {
  const result = calculateBookingPricing({
    pricePerNightPaise: 200000, // ₹2,000 / night
    numberOfNights: 3,
    numberOfRooms: 2,
    taxRatePercent: 12
  });

  // Base: 2000 * 3 nights * 2 rooms = ₹12,000 (1,200,000 paise)
  assert.strictEqual(result.baseAmountPaise, 1200000);
  // Tax: 12% of 12,000 = ₹1,440 (144,000 paise)
  assert.strictEqual(result.taxAmountPaise, 144000);
  // Total: 12,000 + 1,440 = ₹13,440 (1,344,000 paise)
  assert.strictEqual(result.totalAmountPaise, 1344000);
  assert.strictEqual(result.currency, 'INR');
});

test('Pricing: discount calculation applies before tax', () => {
  const result = calculateBookingPricing({
    pricePerNightPaise: 100000, // ₹1,000
    numberOfNights: 1,
    numberOfRooms: 1,
    discountPercent: 10,
    taxRatePercent: 12
  });

  // Base: ₹1,000 (100,000 paise)
  assert.strictEqual(result.baseAmountPaise, 100000);
  // Discount: 10% = ₹100 (10,000 paise)
  assert.strictEqual(result.discountAmountPaise, 10000);
  // Taxable: ₹900 (90,000 paise)
  assert.strictEqual(result.taxableAmountPaise, 90000);
  // Tax: 12% of 900 = ₹108 (10,800 paise)
  assert.strictEqual(result.taxAmountPaise, 10800);
  // Total: ₹1,008 (100,800 paise)
  assert.strictEqual(result.totalAmountPaise, 100800);
});
