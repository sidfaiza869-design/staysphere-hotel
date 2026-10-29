/**
 * StaySphere Currency & Tax Utilities
 * Consistent integer-paise representation and en-IN formatting
 */

const DEFAULT_TAX_RATE_PERCENT = parseInt(process.env.TAX_RATE_PERCENT || '12', 10);

/**
 * Convert rupees to integer paise
 * @param {number} rupees 
 * @returns {number} integer paise
 */
function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

/**
 * Convert paise to rupees (decimal)
 * @param {number} paise 
 * @returns {number} rupees
 */
function paiseToRupees(paise) {
  return Number(paise) / 100;
}

/**
 * Format paise into Indian Rupee string (₹) using en-IN locale
 * @param {number} paise 
 * @returns {string} e.g. "₹2,499" or "₹2,499.50"
 */
function formatINR(paise) {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rupees);
}

/**
 * Calculate full booking pricing breakdown on the backend
 * Never trust client totals
 * 
 * @param {Object} params
 * @param {number} params.pricePerNightPaise
 * @param {number} params.numberOfNights
 * @param {number} params.numberOfRooms
 * @param {number} [params.discountPercent=0]
 * @param {number} [params.taxRatePercent=DEFAULT_TAX_RATE_PERCENT]
 */
function calculateBookingPricing({
  pricePerNightPaise,
  numberOfNights,
  numberOfRooms,
  discountPercent = 0,
  taxRatePercent = DEFAULT_TAX_RATE_PERCENT
}) {
  const nights = Math.max(1, parseInt(numberOfNights, 10));
  const rooms = Math.max(1, parseInt(numberOfRooms, 10));
  const ratePaise = parseInt(pricePerNightPaise, 10);

  const baseAmountPaise = ratePaise * nights * rooms;

  const validDiscountPercent = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  const discountAmountPaise = Math.round((baseAmountPaise * validDiscountPercent) / 100);

  const taxableAmountPaise = baseAmountPaise - discountAmountPaise;

  const taxPercent = Math.max(0, Number(taxRatePercent) || DEFAULT_TAX_RATE_PERCENT);
  const taxAmountPaise = Math.round((taxableAmountPaise * taxPercent) / 100);

  const totalAmountPaise = taxableAmountPaise + taxAmountPaise;

  return {
    roomRatePaise: ratePaise,
    numberOfNights: nights,
    numberOfRooms: rooms,
    baseAmountPaise,
    discountPercent: validDiscountPercent,
    discountAmountPaise,
    taxableAmountPaise,
    taxRatePercent: taxPercent,
    taxAmountPaise,
    totalAmountPaise,
    currency: 'INR'
  };
}

module.exports = {
  DEFAULT_TAX_RATE_PERCENT,
  rupeesToPaise,
  paiseToRupees,
  formatINR,
  calculateBookingPricing
};
