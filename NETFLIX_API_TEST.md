# Netflix API Testing Instructions

## Overview
I've set up a complete testing environment for your localhost:3000 Netflix API in your React Native app. The API test functionality is now integrated into your app as a new tab in the bottom navigation.

## What Was Created

### 1. API Service (`src/services/netflixLocalApi.ts`)
- **Purpose**: Provides type-safe functions to interact with your localhost API
- **API Base URL**: `http://localhost:3000/api` (configurable)
- **Functions**:
  - `searchNetflix(query)` - Search for content
  - `getNetflixDetails(videoId)` - Get video/series details
  - `getNetflixEpisodes(seriesId)` - Get episodes for a series
  - `getNetflixStream(videoId, hash)` - Get streaming URL
  - `testAllEndpoints()` - Test all endpoints at once

### 2. Test Component (`src/components/NetflixApiTest.tsx`)
- **Purpose**: Visual interface for testing API endpoints
- **Features**:
  - One-click testing of all 4 endpoints
  - Color-coded status indicators (green = success, red = error)
  - Response data preview with JSON formatting
  - Summary of passed/failed tests
  - Scrollable interface with clean design

### 3. Test Screen (`src/screens/ApiTestScreen.tsx`)
- **Purpose**: Wrapper screen for navigation integration
- **Access**: Available as a new tab in the bottom navigation bar

### 4. Updated Navigation (`src/navigation/BottomTabNavigator.tsx`)
- **Change**: Added "API Test" tab with TestTube icon
- **Position**: Last tab in the bottom navigation

## How to Use

### Step 1: Ensure Your API Server is Running
```bash
# In your API project directory
node server.js
# Or whatever command starts your server on port 3000
```

### Step 2: Run Your React Native App
```bash
# In this project directory
npm start
# Then press 'a' for Android or 'i' for iOS
```

### Step 3: Navigate to API Test Tab
- Look for the "API Test" tab in the bottom navigation (TestTube icon)
- Tap on it to open the test screen

### Step 4: Run Tests
- Tap the "Run Tests" button
- Watch as all 4 endpoints are tested in sequence
- Review the results for each endpoint

## Test Endpoints

The test will verify:
1. ✓ **Search** - `/api/search?q=Stranger`
2. ✓ **Details** - `/api/details/80057281`
3. ⚠️ **Episodes** - `/api/episodes/80057281` (may error if wrong ID type)
4. ⚠️ **Stream** - `/api/stream?id=80057281&hash=test` (returns {r: "n"} expected)

## Testing on Physical Device

If testing on a physical device instead of emulator:

1. Find your computer's IP address:
   - Windows: `ipconfig` → Look for IPv4 Address
   - Mac/Linux: `ifconfig` → Look for inet address

2. Update the API base URL in `src/services/netflixLocalApi.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
   // For example: 'http://192.168.1.5:3000/api'
   ```

3. Make sure your phone and computer are on the same WiFi network

## Expected Results

### ✅ Search Endpoint
- **Status**: Should pass (✓)
- **Response**: Array of search results
- **Sample**: Movies/series matching "Stranger"

### ✅ Details Endpoint
- **Status**: Should pass (✓)
- **Response**: Complete details object
- **Sample**: Title, year, cast, description, seasons, etc.

### ⚠️ Episodes Endpoint
- **Status**: May fail if 80057281 is not a valid Series ID
- **Response**: Array of episodes if successful
- **Note**: You may need to use a different series ID

### ⚠️ Stream Endpoint
- **Status**: Will "succeed" but return `{r: "n"}`
- **Response**: `{r: "n"}` due to server-side protections
- **Note**: This is expected behavior per your description

## Troubleshooting

### "Network Error" or "Connection Refused"
- ✓ Check that your API server is running on localhost:3000
- ✓ If on physical device, update IP address as described above
- ✓ Ensure firewall isn't blocking port 3000

### "Cannot find variable: axios" or similar errors
```bash
npm install axios
```

### Test button doesn't work
- Check Metro bundler console for errors
- Check React Native debugger console (Cmd+D or Ctrl+M → Debug)

## Next Steps

Once all tests pass, you can:
1. Integrate these API functions into your existing screens
2. Replace the current API calls in `src/services/api.ts` with your localhost API
3. Update the `fetchMovieDetails()` and other functions to use your new API
4. Test the full app flow with real data from your API

## Code Structure

```
src/
├── services/
│   ├── api.ts              (existing API - currently using net20.cc)
│   └── netflixLocalApi.ts  (NEW - your localhost API)
├── components/
│   └── NetflixApiTest.tsx  (NEW - test UI component)
├── screens/
│   └── ApiTestScreen.tsx   (NEW - test screen wrapper)
└── navigation/
    └── BottomTabNavigator.tsx  (UPDATED - added API Test tab)
```

## Notes

- The test uses hardcoded IDs (80057281 for Stranger Things as example)
- You can modify the test IDs in `netflixLocalApi.ts` → `testAllEndpoints()`
- All TypeScript types are defined for proper autocomplete and error checking
- The component is fully styled to match your app's Netflix theme
