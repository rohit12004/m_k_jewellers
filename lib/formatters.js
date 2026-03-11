/**
 * Format a number as INR (Indian Rupee)
 * Output example: ₹1,25,000.00
 * @param {number} amount - The amount to format
 * @param {boolean} includeFraction - Whether to include decimal places
 * @returns {string} Formatted currency string
 */
export const formatINR = (amount, includeFraction = true) => {
  if (amount === undefined || amount === null) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeFraction ? 2 : 0,
    maximumFractionDigits: includeFraction ? 2 : 0,
  }).format(amount);
};

/**
 * Format a number in Indian units (Lakhs, Crores)
 * Output example: 1.25L, 2.5Cr
 * @param {number} amount - The amount to format
 * @returns {string} Formatted string
 */
export const formatCompactINR = (amount) => {
  if (amount === undefined || amount === null) return '0';
  
  if (amount >= 10000000) {
    return (amount / 10000000).toFixed(2) + ' Cr';
  } else if (amount >= 100000) {
    return (amount / 100000).toFixed(2) + ' L';
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + ' K';
  }
  
  return amount.toString();
};
