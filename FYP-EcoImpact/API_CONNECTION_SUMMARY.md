# API Connection Implementation Summary

## Changes Made

### 1. Backend CORS Update
**File**: `backend/app.py`
- Updated CORS middleware to allow:
  - `http://localhost:5173` (Vite default port)
  - `http://127.0.0.1:5173`
  - `http://localhost:3000` (React default port)
  - `http://127.0.0.1:3000`

### 2. Frontend Environment File
**File**: `frontend/.env` (NEW)
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Frontend API Helper
**File**: `frontend/src/utils/api.js` (NEW)
- Created fetch wrapper with authentication support
- Automatically reads token from `localStorage.getItem('token')`
- Adds `Authorization: Bearer <token>` header when token exists
- Provides helper methods: `apiGet`, `apiPost`, `apiPut`, `apiDelete`
- Uses `VITE_API_BASE_URL` from environment

### 4. Simulate Page Updates
**File**: `frontend/src/pages/Simulate.js`
- Removed mock data banner (no longer shows automatically)
- Updated to use `apiPost` from API helper
- Calls `POST /predict/all` endpoint
- Shows proper error messages instead of falling back to mock data
- Checks for authentication token before making request
- Shows "Please login to run simulation." message if not logged in
- Transforms FastAPI response format to match frontend expectations

### 5. FastAPI Endpoint
**File**: `backend/app.py`
- Added `POST /predict/all` endpoint (alias for `/api/simulate`)
- Same functionality as existing `/api/simulate` endpoint

## API Contract

### Request to `/predict/all`
```json
{
  "country": "Pakistan",
  "policy_type": "Carbon Tax",  // or "ETS"
  "carbon_price": 25.0,
  "duration": 5,
  "year": 2024
}
```

### Response Format
```json
{
  "success": true,
  "inputs": {
    "duration": 5,
    "policy_type": "Carbon Tax",
    "carbon_price": 25.0,
    "country": "Pakistan",
    "year": 2024
  },
  "success_probability": 0.85,
  "risk_level": "low",
  "status": "Low Risk",
  "yearly_predictions": [
    {
      "year": 2024,
      "revenue_million_usd": 1250.5,
      "coverage": null,
      "co2_reduction_percent": null,
      "gdp_impact": null
    }
  ],
  "overall_revenue": 6250.0,
  "overall_co2_reduction": null
}
```

## Usage

1. **Start FastAPI Backend**:
   ```bash
   cd backend
   python app.py
   # or
   uvicorn app:app --reload --port 8000
   ```

2. **Start Frontend** (if using Vite):
   ```bash
   cd frontend
   npm run dev  # Vite default port is 5173
   ```

3. **Login/Signup** first to get authentication token

4. **Run Simulation** from Simulate page

## Authentication

- Token is stored in `localStorage.getItem('token')`
- API helper automatically adds `Authorization: Bearer <token>` header
- If no token, user sees "Please login to run simulation." message

## Error Handling

- Network errors show clear error messages
- API errors display the error message from backend
- No automatic fallback to mock data (removed for production use)

## Notes

- The FastAPI backend doesn't currently have JWT authentication middleware implemented
- You may need to add JWT validation in FastAPI if required
- The endpoint will accept requests with or without JWT token (depends on your backend implementation)



