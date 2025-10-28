const asyncHandler = require("express-async-handler");
const dataService = require("../services/dataService");

/**
 * @route   POST /api/data
 * @desc    Fetch data from external APIs and save to database
 * @access  Public
 */
const fetchData = asyncHandler(async (req, res) => {
  console.log("Fetching data from external APIs...");

  const result = await dataService.fetchAndSaveData();

  if (result.success) {
    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } else {
    return res.status(500).json({
      success: false,
      message: result.message,
      error: result.error,
    });
  }
});

module.exports = { fetchData };
