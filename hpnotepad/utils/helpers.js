/**
 * Formats a date object to YYYY-MM-DD string
 * @param {Date} date - Date object to format
 * @returns {String} Formatted date string
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Gets start and end of day for a given date
 * @param {String} dateString - Date string in YYYY-MM-DD format
 * @returns {Object} Object with startOfDay and endOfDay Date objects
 */
const getDayBoundaries = (dateString) => {
  const startOfDay = new Date(dateString);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { startOfDay, endOfDay };
};

/**
 * Validates date string format (YYYY-MM-DD)
 * @param {String} dateString - Date string to validate
 * @returns {Boolean} True if valid format
 */
const isValidDateFormat = (dateString) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
};

/**
 * Creates a standardized success response
 * @param {String} message - Success message
 * @param {*} data - Data to include in response
 * @returns {Object} Standardized response object
 */
const successResponse = (message, data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  return response;
};

/**
 * Creates a standardized error response
 * @param {String} message - Error message
 * @param {String} error - Error details (optional)
 * @returns {Object} Standardized error object
 */
const errorResponse = (message, error = null) => {
  const response = {
    success: false,
    message,
  };
  if (error) {
    response.error = error;
  }
  return response;
};

module.exports = {
  formatDate,
  getDayBoundaries,
  isValidDateFormat,
  successResponse,
  errorResponse,
};
