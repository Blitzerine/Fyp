# Backend Connection Guide for Simulate Page

## Overview
The Simulate page is now connected to the backend API. This guide explains how to ensure it's working properly.

## API Contract

### Frontend Request
```
POST /api/simulate
Headers: {
  Content-Type: application/json
  Authorization: Bearer <token>
}
Body: {
  country: string,
  policyType: "CARBON_TAX" | "ETS",
  carbonPriceUSD: number,
  durationYears: number
}
```

### Backend Response
```json
{
  "success": true,
  "inputs": {
    "country": "string",
    "policyType": "CARBON_TAX" | "ETS",
    "carbonPriceUSD": number,
    "durationYears": number
  },
  "predictions": {
    "emissionCoveragePct": number,
    "annualRevenueMillionUSD": number,
    "confidence": {
      "coverageLow": number,
      "coverageHigh": number,
      "revenueLow": number,
      "revenueHigh": number
    }
  },
  "countryContext": {
    "population": number,
    "gdpPPP": number,
    "annualCO2Tons": number,
    "fossilFuelDependencyPct": number,
    "energyMixKwhPerCapita": {...},
    "region": string,
    "incomeGroup": string
  },
  "similarPolicies": [...]
}
```

## How It Works

1. **Node.js Backend** (`backend/controllers/simulateController.js`):
   - Accepts the frontend request
   - Normalizes field names (handles both old and new format)
   - Tries to call FastAPI ML backend first (if available)
   - Falls back to mock data if FastAPI is not available
   - Returns formatted response matching frontend expectations

2. **FastAPI ML Backend** (optional):
   - If running on port 8000, the Node.js backend will call it
   - FastAPI returns ML predictions
   - Node.js transforms the response to match frontend format

3. **Mock Data Fallback**:
   - If FastAPI is not available, uses mock data from `backend/services/mlService.js`
   - Mock data is generated to match the frontend format exactly

## Setup Instructions

### 1. Start Node.js Backend
```bash
cd FYP-EcoImpact/backend
npm start
```
The backend should start on `http://localhost:5000`

### 2. (Optional) Start FastAPI ML Backend
If you have ML models set up:
```bash
cd FYP-EcoImpact/backend
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### 3. Start Frontend
```bash
cd FYP-EcoImpact/frontend
npm start
```

## Troubleshooting

### Issue: "Using mock data for demonstration" message shows

**This is normal if:**
- FastAPI ML backend is not running
- FastAPI ML backend models are not loaded
- FastAPI ML backend is not accessible

**To fix:**
1. The mock data will still work and show realistic results
2. To use real ML predictions, start the FastAPI backend with models loaded
3. Check backend console logs for connection errors

### Issue: "Cannot connect to server"

**Check:**
1. Is the Node.js backend running on port 5000?
2. Check `backend/.env` file has correct configuration
3. Check browser console for CORS errors
4. Verify `API_BASE_URL` in frontend config

### Issue: API returns error

**Check backend logs for:**
- Field validation errors (check request body format)
- Authentication errors (ensure user is logged in)
- ML model errors (if using FastAPI)

## Response Flow

1. Frontend sends request → Node.js Backend (`/api/simulate`)
2. Node.js Backend → Tries FastAPI ML Backend (if available)
3. FastAPI ML Backend → Returns ML predictions (or error)
4. Node.js Backend → Transforms response → Returns to Frontend
5. Frontend → Displays results (or shows mock data notice)

## Testing

### Test with Mock Data (Always Available)
1. Start Node.js backend
2. Start frontend
3. Run simulation - it will use mock data automatically

### Test with FastAPI (Requires Models)
1. Start FastAPI backend with models loaded
2. Start Node.js backend
3. Start frontend
4. Run simulation - it will use real ML predictions
5. Check backend console: Should see "✅ FastAPI ML backend responded successfully"

## Files Modified

- `backend/controllers/simulateController.js` - Updated to match frontend API contract
- `backend/services/mlService.js` - Added `runMockSimulationForFrontend` function
- `frontend/src/pages/Simulate.js` - Already configured correctly

## Notes

- The backend now accepts both old format (`duration`, `carbonPrice`) and new format (`durationYears`, `carbonPriceUSD`)
- Policy type accepts: `CARBON_TAX`, `Carbon Tax`, `carbonTax`, etc. (normalized internally)
- Mock data is generated dynamically based on input parameters
- All responses are transformed to match frontend expectations exactly



