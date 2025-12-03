# 🎬 Testing Netflix Localhost API Integration

## What I've Done

I've integrated your localhost:3000 Netflix API into your React Native app so that:
1. **Search** functionality uses your localhost API
2. **Movie/Series Details** are fetched from your localhost API  
3. **Automatic fallback** to the existing net20.cc API if localhost fails
4. **Easy to enable/disable** via a simple flag

## 🚀 How to Test

### Step 1: Start Your Localhost API Server

**IMPORTANT:** Your localhost API must be running first!

Based on your earlier conversation, you should have an API server that runs on `localhost:3000`. Start it with:

```bash
# Navigate to your API directory (wherever your server.js file is)
cd path/to/your/api/directory
node server.js
```

You should see something like:
```
Server running on http://localhost:3000
```

### Step 2: Verify API is Working

Quick test to confirm it's running:
```bash
curl http://localhost:3000/api/search?q=Stranger
```

Or run the test script I created:
```bash
node test-netflix-api.js
```

### Step 3: Test in Your App

The app is **already running** in your emulator! Now:

1. **Go to the Home tab** (first tab in bottom navigation)
2. **Search for something** - Type "Stranger" in the search box
3. **Watch the console logs** - You'll see:
   ```
   [Localhost API] Trying to search "Stranger" from localhost:3000
   [Localhost API] ✓ Successfully got X search results from localhost
   ```
4. **Tap on a movie/series** to view details
5. **Check the logs** again:
   ```
   [Localhost API] Trying to fetch details for 80057281 from localhost:3000
   [Localhost API] ✓ Successfully fetched details from localhost
   ```
6. **Try to play** - Click the Play button

## 📊 What to Monitor

### Console Logs

Open Metro bundler console (where you ran `npm start`) and watch for these logs:

**Success:**
```
[Localhost API] Trying to search "Stranger" from localhost:3000
[Localhost API] ✓ Successfully got 15 search results from localhost
```

**Fallback (when localhost server isn't running)**
```
[Localhost API] Trying to search "Stranger" from localhost:3000
[Localhost API] ✗ Search failed, falling back to net20.cc: AxiosError: Network Error
```

### Checking Different Features

| Feature | What Happens | Where to Look |
|---------|-------------|---------------|
| **Search** | Fetches from localhost first | Search screen, console logs |
| **Details** | Fetches from localhost first | Details page, console logs |
| **Episodes** | Currently uses net20.cc | Episodes tab |
| **Streaming** | Uses existing getStreamUrl | Video player |

## ⚙️ Configuration

### Enable/Disable Localhost API

Edit `src/services/api.ts`:

```typescript
// Configuration for localhost API
const USE_LOCALHOST_API = true; // Set to false to disable localhost API
```

### Change API URL (for physical device)

If testing on a physical device instead of emulator:

```typescript
// In src/services/netflixLocalApi.ts
export let API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
// Example: 'http://192.168.1.5:3000/api'
```

Then restart the app.

## 🧪 Testing Scenarios

### Scenario 1: Localhost API Working
**Setup:** API server running on localhost:3000
**Expected:** 
- Search results from localhost API
- Details from localhost API
- Console shows ✓ success messages
- Fallback never triggered

### Scenario 2: Localhost API Not Running
**Setup:** API server stopped
**Expected:**
- Search still works (uses net20.cc fallback)
- Details still work (uses net20.cc fallback)
- Console shows ✗ failed messages then fallback
- App continues to function normally

### Scenario 3: Localhost API Errors
**Setup:** API server returns errors
**Expected:**
- App automatically falls back to net20.cc
- User doesn't see any difference
- Console shows the error and fallback

## 🎥 Testing Playback

To test if movies actually play:

1. **Search for a movie** (e.g., "Stranger Things")
2. **Open the details page**
3. **Click the Play button**
4. **What should happen:**
   - Details are fetched from localhost API ✓
   - Playback URL is still fetched from getStreamUrl (existing method)
   - Video should load and play

**Note:** The streaming part still uses the existing `getStreamUrl` function because:
- Your localhost `/api/stream` endpoint returns `{r: "n"}` (not functional yet)
- The existing stream method still works

## 📝 What's Currently Integrated

| Feature | Uses Localhost API? | Status |
|---------|-------------------|--------|
| Search | ✅ Yes (with fallback) | Ready |
| Details | ✅ Yes (with fallback) | Ready |
| Episodes | ❌ Not yet | Future |
| Streaming | ❌ Uses existing method | Existing works |

## 🔧 Troubleshooting

### "Network Error" in console
**Problem:** API server not running or wrong URL
**Solution:** 
1. Check if localhost:3000 is running
2. Test with: `curl http://localhost:3000/api/search?q=test`
3. If on physical device, use IP address instead of localhost

### No data showing
**Problem:** API returns empty or invalid data
**Solution:**
1. Check API server logs
2. Test endpoints with curl or Postman
3. Check console logs for error messages

### App crashes
**Problem:** Data format mismatch
**Solution:**
1. Check Metro bundler for error stack trace
2. Verify API response format matches expected structure

### Fallback always triggers
**Problem:** Localhost API not reachable
**Solution:**
1. Verify API is running: `curl http://localhost:3000/api/search?q=test`
2. Check firewall settings
3. If on physical device, use IP address

## 🎯 Next Steps

### If Everything Works:
1. ✅ Verify search results are coming from localhost
2. ✅ Verify details are  from localhost
3. ✅ Test playback works
4. 🔄 Consider integrating episodes endpoint
5. 🔄 Consider integrating streaming endpoint (when fixed)

### If You See Network Errors:
1. **First**: Make sure your API server is running!
   ```bash
   # In your API directory
   node server.js
   ```
2. **Second**: Test the API directly:
   ```bash
   node test-netflix-api.js
   ```
3. **Third**: Check the app logs for specific error messages

## 💡 Tips

- Keep Metro bundler console open to see logs
- Test with the API Test tab first to verify endpoints
- Search for "Stranger" - it's known to return results
- If streaming doesn't work, check the existing API issues (not related to localhost)

---

**Current Status:** Localhost API is integrated and ready to test! Just make sure your API server is running. 🚀
