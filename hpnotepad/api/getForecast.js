const axios = require("axios");
const dotenv = require("dotenv");

//fourt api call - weather
const getForecast = async () => {
  const options = {
    method: "GET",
    url: "https://forecast9.p.rapidapi.com/rapidapi/forecast/Barcelona/summary/",
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "forecast9.p.rapidapi.com",
    },
  };

  try {
    let response = await axios.request(options);
    if (response.status >= 200 && response.status < 300) {
      const items = response.data.forecast.items;
      const extractedData = items.slice(0, 10).map((item) => ({
        date: item.date,
        min: item.temperature.min,
        max: item.temperature.max,
      }));

      return {
        data: extractedData,
        response: {
          success: true,
          errorMessage: "",
        },
      };
    } else {
      return {
        data: [],
        response: {
          success: false,
          errorMessage: "Error fetching forecast data",
        },
      };
    }
  } catch (error) {
    return {
      data: [],
      response: {
        success: false,
        errorMessage: "Error fetching forecast data",
      },
    };
  }
};

module.exports = { getForecast };
