# HPNotepad API

A Node.js API that aggregates daily data from multiple external APIs (jokes, horoscopes, weather, moon phase, and news) and stores them in a MongoDB database.

## 📁 Project Structure

```
hpnotepad/
├── api/                      # External API integrations
│   ├── getForecast.js       # Weather forecast API
│   ├── getHoroscope.js      # Horoscope API
│   ├── getJoke.js           # Dad jokes API
│   ├── getMoonPhase.js      # Moon phase API
│   └── getNews.js           # CNBC news API
├── controllers/             # Route handlers
│   ├── fetchDataController.js    # Handles data fetching
│   ├── getDataController.js      # Handles data retrieval
│   └── deleteDataController.js   # Handles data deletion
├── models/                  # MongoDB schemas
│   └── dataModel.js        # Main data schema
├── routes/                  # API routes
│   └── dataRoute.js        # Data routes
├── services/                # Business logic
│   └── dataService.js      # Data operations service
└── utils/                   # Helper functions
    └── helpers.js          # Utility functions
```

## 🚀 API Endpoints

### 1. Fetch and Save Data

**POST** `/api/data`

Fetches data from all external APIs and saves it to the database.

**Response:**

```json
{
  "success": true,
  "message": "Data fetched and saved successfully",
  "data": { ... }
}
```

**Example:**

```bash
curl -X POST http://localhost:5000/api/data
```

---

### 2. Get Data by Date

**GET** `/api/data/:date`

Retrieves data for a specific date. If no data exists for today's date, it will automatically fetch fresh data.

**Parameters:**

- `date` (required) - Date in YYYY-MM-DD format

**Response:**

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [{ ... }]
}
```

**Examples:**

```bash
# Get today's data (will fetch if not exists)
curl http://localhost:5000/api/data/2024-10-28

# Get historical data
curl http://localhost:5000/api/data/2024-10-15
```

---

### 3. Delete Data Before Date

**DELETE** `/api/data/delete?date=YYYY-MM-DD`

Deletes all data entries before the specified date.

**Query Parameters:**

- `date` (optional) - Date in YYYY-MM-DD format (defaults to 2024-10-14)

**Response:**

```json
{
  "success": true,
  "message": "Deleted 10 records",
  "deletedCount": 10
}
```

**Example:**

```bash
curl -X DELETE "http://localhost:5000/api/data/delete?date=2024-10-01"
```

---

## 📊 Data Structure

Each saved data entry contains:

```javascript
{
  date: Date,
  joke: {
    data: {
      setup: String,
      punchline: String
    },
    response: {
      success: Boolean,
      errorMessage: String
    }
  },
  horoscope: {
    data: {
      aries: String,
      taurus: String,
      gemini: String,
      // ... all 12 zodiac signs
    },
    response: {
      success: Boolean,
      errorMessage: String
    }
  },
  moonPhase: {
    data: {
      mainText: String,
      fullMoon: Number
    },
    response: {
      success: Boolean,
      errorMessage: String
    }
  },
  forecast: {
    data: [{
      date: String,
      min: Number,
      max: Number
    }],
    response: {
      success: Boolean,
      errorMessage: String
    }
  },
  news: {
    data: [{
      title: String,
      description: String,
      url: String,
      body: String,
      snippet: String,
      image: String
    }],
    response: {
      success: Boolean,
      errorMessage: String
    }
  }
}
```

## 🔧 Key Features

### Service Layer Pattern

Business logic is separated into `dataService.js`, making the code more maintainable and testable.

### Error Handling

- Consistent error responses across all endpoints
- Graceful handling of external API failures
- Individual API failure tracking (each API has its own success flag)

### Automatic Data Fetching

When requesting today's data via GET endpoint, if no data exists, it automatically fetches fresh data from all APIs.

### Controller Separation

Each major operation has its own controller:

- `fetchDataController` - Handles data fetching
- `getDataController` - Handles data retrieval
- `deleteDataController` - Handles data deletion

## 🛠️ Environment Variables

Required environment variables:

```
RAPID_API_KEY=your_rapid_api_key_here
```

## 📝 Usage Examples

### Postman/Thunder Client

1. **Fetch Today's Data:**

   ```
   POST http://localhost:5000/api/data
   ```

2. **Get Data for Today:**

   ```
   GET http://localhost:5000/api/data/2024-10-28
   ```

3. **Get Historical Data:**

   ```
   GET http://localhost:5000/api/data/2024-10-15
   ```

4. **Delete Old Data:**
   ```
   DELETE http://localhost:5000/api/data/delete?date=2024-10-01
   ```

## 🎯 Improvements Made

1. ✅ **Fixed Postman Response Issue** - `fetchData` now properly sends HTTP responses
2. ✅ **Separation of Concerns** - Controllers, services, and utilities are properly separated
3. ✅ **Better Error Handling** - Consistent error responses with proper HTTP status codes
4. ✅ **Code Organization** - Split into multiple focused files
5. ✅ **Removed Dead Code** - Cleaned up commented-out code
6. ✅ **Better Documentation** - Added JSDoc comments throughout
7. ✅ **Consistent Response Format** - All endpoints return standardized JSON responses
8. ✅ **Utility Functions** - Created reusable helper functions

## 🔮 Future Enhancements

- Add authentication/authorization for DELETE endpoint
- Implement caching for frequently requested dates
- Add rate limiting for external API calls
- Create scheduled tasks (cron jobs) for automatic daily data fetching
- Add data validation middleware
- Implement pagination for large datasets
- Add comprehensive logging
- Create unit and integration tests
