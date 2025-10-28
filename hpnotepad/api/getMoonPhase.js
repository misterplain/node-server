const axios = require("axios");
const dotenv = require("dotenv");

//third api call - moonphase
const getMoonPhase = async () => {
  const options = {
    method: "GET",
    url: "https://moon-phase.p.rapidapi.com/basic",
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "moon-phase.p.rapidapi.com",
    },
  };

  try {
    let response = await axios.request(options);
    if (response.status >= 200 && response.status < 300) {
      const moonphaseData = {
        data: {
          mainText: response.data.phase_name,
          fullMoon: response.data.days_until_next_full_moon,
        },
        response: {
          success: true,
          errorMessage: "",
        },
      };
      return moonphaseData;
    } else {
      return {
        data: {},
        response: {
          success: false,
          errorMessage: "Error fetching moon phase data",
        },
      };
    }
  } catch (error) {
    return {
      data: {},
      response: {
        success: false,
        errorMessage: "Error fetching moon phase data",
      },
    };
  }
};

module.exports = { getMoonPhase };
