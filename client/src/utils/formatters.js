/**
 * Format integer paise into Indian Rupee string (₹) with en-IN numbering
 * @param {number} paise 
 * @returns {string} e.g. "₹2,499"
 */
export function formatINR(paise) {
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0';
  const rupees = Number(paise) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rupees);
}

/**
 * Format ISO date string into readable Indian format: "24 Nov 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d);
}

/**
 * Calculate stay duration in nights between two dates
 */
export function calculateStayNights(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return 1;
  const inD = new Date(checkInDate);
  const outD = new Date(checkOutDate);
  const diffTime = outD.getTime() - inD.getTime();
  const nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, isNaN(nights) ? 1 : nights);
}

/**
 * Standard Indian destinations list for quick selection
 */
export const INDIAN_CITIES = [
  'All Cities',
  'Indore',
  'Bhopal',
  'Mumbai',
  'Pune',
  'Delhi',
  'Jaipur',
  'Udaipur',
  'Goa',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Varanasi',
  'Agra',
  'Kochi',
  'Shimla',
  'Manali',
  'Rishikesh'
];
