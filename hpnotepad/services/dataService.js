const Data = require("../models/dataModel");
const { getForecast } = require("../api/getForecast");
const { getHoroscope } = require("../api/getHoroscope");
const { getJoke } = require("../api/getJoke");
const { getMoonPhase } = require("../api/getMoonPhase");
const { getNews } = require("../api/getNews");

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

/**
 * Fetches all external API data in parallel
 * @returns {Promise<Object>} Object containing all fetched data
 */
const fetchAllExternalData = async () => {
  try {
    // Fetch basic data in parallel
    const [joke, moonPhase, forecast, news] = await Promise.all([
      getJoke(),
      getMoonPhase(),
      getForecast(),
      getNews(),
    ]);

    // Fetch all horoscope signs in parallel
    const horoscopeResults = await Promise.all(
      HOROSCOPE_SIGNS.map((sign) => getHoroscope(sign))
    );

    // Process horoscope data
    const horoscopeData = processHoroscopeData(horoscopeResults);

    return {
      date: new Date(),
      joke,
      moonPhase,
      forecast,
      news,
      horoscope: horoscopeData,
    };
  } catch (error) {
    console.error("Error fetching external data:", error.message);
    throw new Error("Failed to fetch external data");
  }
};

/**
 * Processes horoscope results into a structured format
 * @param {Array} results - Array of horoscope results
 * @returns {Object} Processed horoscope data
 */
const processHoroscopeData = (results) => {
  const horoscopeData = {
    data: {},
    response: {
      success: true,
      errorMessage: "",
    },
  };

  results.forEach((result, index) => {
    const sign = HOROSCOPE_SIGNS[index];
    horoscopeData.data[sign] = result.data;

    if (!result.response.success) {
      horoscopeData.response.success = false;
      horoscopeData.response.errorMessage =
        "One or more horoscope fetches failed";
    }
  });

  return horoscopeData;
};

/**
 * Saves fetched data to the database
 * @param {Object} fetchedData - Data to save
 * @returns {Promise<Object>} Save result with success status
 */
const saveDataToDB = async (fetchedData) => {
  const dataToSave = {
    date: fetchedData.date,
    horoscope: fetchedData.horoscope || {
      data: {},
      response: {
        success: false,
        errorMessage: "Horoscope data not available",
      },
    },
    joke: fetchedData.joke || {
      data: {},
      response: { success: false, errorMessage: "Joke data not available" },
    },
    moonPhase: fetchedData.moonPhase || {
      data: {},
      response: {
        success: false,
        errorMessage: "Moon phase data not available",
      },
    },
    forecast: fetchedData.forecast || {
      data: [],
      response: { success: false, errorMessage: "Forecast data not available" },
    },
    news: fetchedData.news || {
      data: [],
      response: { success: false, errorMessage: "News data not available" },
    },
  };

  try {
    const newData = new Data(dataToSave);
    const savedData = await newData.save();
    console.log("Data saved to database successfully");

    return {
      success: true,
      message: "Data saved to database",
      data: savedData,
    };
  } catch (error) {
    console.error("Error saving data to database:", error.message);
    return {
      success: false,
      message: "Error saving data to database",
      error: error.message,
    };
  }
};

/**
 * Fetches and saves all data
 * @returns {Promise<Object>} Result with saved data
 */
const fetchAndSaveData = async () => {
  try {
    const fetchedData = await fetchAllExternalData();
    const saveResult = await saveDataToDB(fetchedData);

    if (!saveResult.success) {
      throw new Error(saveResult.message);
    }

    return {
      success: true,
      message: "Data fetched and saved successfully",
      data: saveResult.data,
    };
  } catch (error) {
    console.error("Error in fetchAndSaveData:", error.message);
    return {
      success: false,
      message: "Failed to fetch and save data",
      error: error.message,
    };
  }
};

/**
 * Retrieves data for a specific date from the database
 * @param {String} dateString - Date string in YYYY-MM-DD format
 * @returns {Promise<Object>} Query result
 */
const getDataByDate = async (dateString) => {
  try {
    const startOfDay = new Date(dateString);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    const data = await Data.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).exec();

    return {
      success: true,
      data,
      count: data.length,
    };
  } catch (error) {
    console.error("Error fetching data by date:", error.message);
    return {
      success: false,
      message: "Error fetching data by date",
      error: error.message,
    };
  }
};

/**
 * Checks if a date string represents today
 * @param {String} dateString - Date string in YYYY-MM-DD format
 * @returns {Boolean}
 */
const isToday = (dateString) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayString = `${year}-${month}-${day}`;

  return dateString === todayString;
};

/**
 * Deletes data before a specified date
 * @param {String} dateString - Date string in YYYY-MM-DD format
 * @returns {Promise<Object>} Deletion result
 */
const deleteDataBeforeDate = async (dateString) => {
  try {
    const startOfDay = new Date(dateString);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    const result = await Data.deleteMany({
      date: { $lte: endOfDay },
    });

    return {
      success: true,
      message: `Deleted ${result.deletedCount} records`,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    console.error("Error deleting data:", error.message);
    return {
      success: false,
      message: "Error deleting data",
      error: error.message,
    };
  }
};

module.exports = {
  fetchAndSaveData,
  getDataByDate,
  isToday,
  deleteDataBeforeDate,
};
