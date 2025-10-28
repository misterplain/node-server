/**
 * Controllers index file
 * Exports all controllers for easier imports
 */

const { fetchData } = require("./fetchDataController");
const { getDataByDate } = require("./getDataController");
const { deleteDataBeforeDate } = require("./deleteDataController");

module.exports = {
  fetchData,
  getDataByDate,
  deleteDataBeforeDate,
};
