const asyncHandler = require("express-async-handler");
const dataService = require("../services/dataService");

/**
 * @route   DELETE /api/data/delete
 * @desc    Delete all data before a specified date
 * @access  Public (should be protected in production)
 */
const deleteDataBeforeDate = asyncHandler(async (req, res) => {
  // Get date from query params or request body
  const dateToDelete = req.query.date || req.body.date || "2024-10-14";

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToDelete)) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format. Use YYYY-MM-DD format.",
    });
  }

  console.log(`Deleting data before ${dateToDelete}...`);

  const result = await dataService.deleteDataBeforeDate(dateToDelete);

  if (result.success) {
    return res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount,
    });
  } else {
    return res.status(500).json({
      success: false,
      message: result.message,
      error: result.error,
    });
  }
});

module.exports = { deleteDataBeforeDate };
