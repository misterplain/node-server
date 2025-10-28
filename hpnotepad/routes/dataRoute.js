const express = require("express");
const router = express.Router();
const {
  fetchData,
  getDataByDate,
  deleteDataBeforeDate,
} = require("../controllers");

// POST /api/data - Fetch and save new data
router.post("/", fetchData);

// GET /api/data/:date - Get data for a specific date (YYYY-MM-DD)
router.get("/:date", getDataByDate);

// DELETE /api/data/delete?date=YYYY-MM-DD - Delete data before specified date
router.delete("/delete", deleteDataBeforeDate);

module.exports = router;
