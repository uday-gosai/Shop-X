/**
 * Formats a number as Indian Rupee currency.
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatPrice = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Formats a date string or object into a human-readable format.
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

/**
 * Truncates string with ellipsis.
 * @param {string} str 
 * @param {number} length 
 */
export const truncate = (str, length = 30) => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
};
