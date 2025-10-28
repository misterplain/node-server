/**
 * API Configuration Constants
 */

// Horoscope zodiac signs in order
const HOROSCOPE_SIGNS = [
  "aquarius",
  "pisces",
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
];

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Default error messages
const ERROR_MESSAGES = {
  FETCH_FAILED: "Failed to fetch data from external APIs",
  SAVE_FAILED: "Failed to save data to database",
  NOT_FOUND: "Data not found for the specified date",
  INVALID_DATE: "Invalid date format. Use YYYY-MM-DD format",
  DELETE_FAILED: "Failed to delete data",
};

// Success messages
const SUCCESS_MESSAGES = {
  FETCH_SUCCESS: "Data fetched and saved successfully",
  RETRIEVE_SUCCESS: "Data retrieved successfully",
  DELETE_SUCCESS: "Data deleted successfully",
};

module.exports = {
  HOROSCOPE_SIGNS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
