const asyncHandler = require("express-async-handler");
const dataService = require("../services/dataService");

/**
 * @route   GET /api/data/:date
 * @desc    Get data for a specific date (YYYY-MM-DD format)
 * @access  Public
 */
const getDataByDate = asyncHandler(async (req, res) => {
  const dateToFind = req.params.date;

  // Validate date format (basic check)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToFind)) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format. Use YYYY-MM-DD format.",
    });
  }

  // Fetch data from database
  const result = await dataService.getDataByDate(dateToFind);

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.message,
      error: result.error,
    });
  }

  // If no data found and it's today's date, fetch new data
  if (result.count === 0 && dataService.isToday(dateToFind)) {
    console.log("No data found for today. Fetching fresh data...");

    const fetchResult = await dataService.fetchAndSaveData();

    if (fetchResult.success) {
      // Retrieve the newly saved data
      const newResult = await dataService.getDataByDate(dateToFind);
      return res.status(200).json({
        success: true,
        message: "Data fetched and retrieved successfully",
        data: newResult.data,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch data for today",
        error: fetchResult.error,
      });
    }
  }

  // If no data found and it's not today
  if (result.count === 0) {
    return res.status(404).json({
      success: false,
      message: "No data found for this date",
    });
  }

  // Data found
  return res.status(200).json({
    success: true,
    message: "Data retrieved successfully",
    data: result.data,
  });
});

module.exports = { getDataByDate };
