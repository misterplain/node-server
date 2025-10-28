/**
 * Test Script for HPNotepad API
 *
 * This script provides example requests for testing the API endpoints.
 * You can run these in Postman, Thunder Client, or use the curl commands.
 */

const API_BASE_URL = "http://localhost:5000/hpnotepad/data";

// Helper to format today's date
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Test Endpoints
 */

// 1. Fetch and save data
console.log("1. Fetch and Save Data:");
console.log(`   POST ${API_BASE_URL}`);
console.log(`   curl -X POST ${API_BASE_URL}`);
console.log("");

// 2. Get today's data
const todayDate = getTodayDate();
console.log("2. Get Today's Data:");
console.log(`   GET ${API_BASE_URL}/${todayDate}`);
console.log(`   curl ${API_BASE_URL}/${todayDate}`);
console.log("");

// 3. Get historical data
console.log("3. Get Historical Data:");
console.log(`   GET ${API_BASE_URL}/2024-10-15`);
console.log(`   curl ${API_BASE_URL}/2024-10-15`);
console.log("");

// 4. Delete old data
console.log("4. Delete Old Data:");
console.log(`   DELETE ${API_BASE_URL}/delete?date=2024-10-01`);
console.log(`   curl -X DELETE "${API_BASE_URL}/delete?date=2024-10-01"`);
console.log("");

console.log("==========================================");
console.log("Expected Response Format:");
console.log("==========================================");
console.log(`
{
  "success": true,
  "message": "Data fetched and saved successfully",
  "data": {
    "date": "2024-10-28T...",
    "joke": {
      "data": {
        "setup": "Why don't scientists trust atoms?",
        "punchline": "Because they make up everything!"
      },
      "response": {
        "success": true,
        "errorMessage": ""
      }
    },
    "horoscope": {
      "data": {
        "aries": "Today is a great day...",
        "taurus": "You will find...",
        // ... all 12 signs
      },
      "response": {
        "success": true,
        "errorMessage": ""
      }
    },
    "moonPhase": {
      "data": {
        "mainText": "Waning Gibbous",
        "fullMoon": 5
      },
      "response": {
        "success": true,
        "errorMessage": ""
      }
    },
    "forecast": {
      "data": [
        {
          "date": "2024-10-28",
          "min": 15,
          "max": 22
        }
        // ... more days
      ],
      "response": {
        "success": true,
        "errorMessage": ""
      }
    },
    "news": {
      "data": [
        {
          "title": "Breaking News...",
          "description": "...",
          "url": "https://...",
          "body": "...",
          "snippet": "...",
          "image": "https://..."
        }
        // ... more articles
      ],
      "response": {
        "success": true,
        "errorMessage": ""
      }
    }
  }
}
`);
