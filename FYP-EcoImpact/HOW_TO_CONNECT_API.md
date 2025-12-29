# How to Connect API to Simulate Page

## Quick Steps

### 1. Start the Node.js Backend Server

Open a terminal and run:
```bash
cd FYP-EcoImpact/backend
npm start
```

You should see:
```
✅ MongoDB Atlas Connected Successfully!
🚀 Server is running on port 5000
📍 API endpoint: http://localhost:5000/api
```

### 2. Verify Backend is Running

Open your browser and visit:
```
http://localhost:5000/api/health
```

You should see:
```json
{"status":"OK","message":"Server is running"}
```

### 3. Make Sure Frontend is Running

In another terminal:
```bash
cd FYP-EcoImpact/frontend
npm start
```

### 4. Test the Connection

1. **Login/Signup** first (you need to be authenticated)
2. Go to the **Simulate** page
3. Fill in the form:
   - Select a country (e.g., "Pakistan")
   - Choose Policy Type (Carbon Tax or ETS)
   - Enter Carbon Price (e.g., 25)
   - Select Duration (e.g., 5 years)
4. Click **"Simulate"** button

### 5. Check if Connected

**If connected successfully:**
- ✅ The warning "Using mock data..." will **NOT** appear
- ✅ Results will be shown immediately
- ✅ Check browser console (F12) - no errors should appear

**If still showing mock data:**
- Check browser console (F12) for errors
- Check backend terminal for error messages
- See troubleshooting section below

## Current API Configuration

The frontend is configured to connect to:
- **URL**: `http://localhost:5000/api`
- **Endpoint**: `POST /api/simulate`
- **Authentication**: Bearer token (from login/signup)

This is set in: `frontend/src/config/api.js`

## How It Works

1. **Frontend sends request** → `POST http://localhost:5000/api/simulate`
   ```json
   {
     "country": "Pakistan",
     "policyType": "CARBON_TAX",
     "carbonPriceUSD": 25,
     "durationYears": 5
   }
   ```

2. **Backend processes request** → `backend/controllers/simulateController.js`
   - Validates input
   - Tries FastAPI ML backend (if available)
   - Falls back to mock data if FastAPI not available
   - Returns formatted response

3. **Frontend receives response** → Displays results

## Troubleshooting

### Issue: Still showing "Using mock data..." warning

**Check 1: Is backend running?**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux
```

**Check 2: Check browser console (F12)**
- Look for network errors
- Check if request to `/api/simulate` is being made
- Check response status (should be 200)

**Check 3: Check backend logs**
- Look for error messages in backend terminal
- Check if request is being received
- Check if authentication is working

**Check 4: Authentication**
- Make sure you're logged in
- Check if token exists: `localStorage.getItem('token')` in browser console
- Try logging out and logging back in

### Issue: "Cannot connect to server" error

1. **Backend not running:**
   ```bash
   cd FYP-EcoImpact/backend
   npm start
   ```

2. **Wrong port:**
   - Check `backend/.env` file: `PORT=5000`
   - Check `backend/server.js` uses `process.env.PORT || 5000`

3. **CORS error:**
   - Backend should allow `http://localhost:3000`
   - Check `backend/server.js` CORS configuration

### Issue: 401 Unauthorized error

- You need to be logged in
- Token might be expired
- Try logging out and logging back in

### Issue: 400 Bad Request error

- Check request format in browser console (Network tab)
- Make sure all required fields are provided:
  - `country` (string)
  - `policyType` ("CARBON_TAX" or "ETS")
  - `carbonPriceUSD` (number > 0)
  - `durationYears` (number 1-20)

## Testing API Directly

You can test the API directly using curl or Postman:

```bash
# Get your token first (login via frontend, then check browser console: localStorage.getItem('token'))

curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "country": "Pakistan",
    "policyType": "CARBON_TAX",
    "carbonPriceUSD": 25,
    "durationYears": 5
  }'
```

## Expected Response Format

```json
{
  "success": true,
  "inputs": {
    "country": "Pakistan",
    "policyType": "CARBON_TAX",
    "carbonPriceUSD": 25,
    "durationYears": 5
  },
  "predictions": {
    "emissionCoveragePct": 45.2,
    "annualRevenueMillionUSD": 1250.5,
    "confidence": {
      "coverageLow": 38.5,
      "coverageHigh": 52.8,
      "revenueLow": 980.2,
      "revenueHigh": 1520.8
    }
  },
  "countryContext": {
    "population": 231402117,
    "gdpPPP": 1200000000000,
    "annualCO2Tons": 227000000,
    "fossilFuelDependencyPct": 64.3,
    "energyMixKwhPerCapita": {...},
    "region": "South Asia",
    "incomeGroup": "Lower middle income"
  },
  "similarPolicies": [...]
}
```

## Note About Mock Data

Even when connected to the backend API, you might still see mock data if:
- FastAPI ML backend is not running (Node.js backend will use mock data)
- ML models are not loaded in FastAPI backend

This is **normal behavior** - the Node.js backend will provide mock data as a fallback.

To use real ML predictions, you need to:
1. Start FastAPI backend on port 8000
2. Load ML models (see `SAVE_MODELS.md`)
3. Node.js backend will automatically use FastAPI if available

## Summary

**To connect the API:**
1. ✅ Start backend: `cd backend && npm start`
2. ✅ Start frontend: `cd frontend && npm start`
3. ✅ Login/Signup to get authentication token
4. ✅ Go to Simulate page and click "Simulate"
5. ✅ Check browser console if issues occur

The connection should work automatically once the backend is running!



