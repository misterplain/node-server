const axios = require("axios");
const dotenv = require("dotenv");

const getHoroscope = async (signHS) => {
  const options = {
    method: "GET",
    url: `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${signHS}&day=TODAY`,
    headers: {
      accept: "application/json",
    },
  };
  try {
    let response = await axios.request(options);
    if (response.data.data.horoscope_data) {
      return {
        data: response.data.data.horoscope_data,
        response: {
          success: true,
          errorMessage: "",
        },
      };
    } else {
      return {
        data: "no horoscope data",
        response: {
          success: false,
          errorMessage: "Horoscope not found or API error",
        },
      };
    }
  } catch (error) {
    return {
      data: "no horoscope data",
      response: {
        success: false,
        errorMessage: "Error fetching horoscope",
      },
    };
  }
};

module.exports = { getHoroscope };
