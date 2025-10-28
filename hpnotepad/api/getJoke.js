const axios = require("axios");
const dotenv = require("dotenv");

const getJoke = async () => {
  const options = {
    method: "GET",
    url: "https://dad-jokes.p.rapidapi.com/random/joke",
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "dad-jokes.p.rapidapi.com",
    },
  };

  try {
    let response = await axios.request(options);
    if (response.status >= 200 && response.status < 300) {
      const joke = {
        data: {
          setup: response.data.body[0].setup,
          punchline: response.data.body[0].punchline,
        },
        response: {
          success: true,
          errorMessage: "",
        },
      };
      return joke;
    } else {
      return {
        data: {},
        response: {
          success: false,
          errorMessage: `Request failed with status code: ${response.status}`,
        },
      };
    }
  } catch (error) {
    return {
      data: {},
      response: {
        success: false,
        errorMessage: "Error fetching joke",
      },
    };
  }
};

module.exports = { getJoke };
