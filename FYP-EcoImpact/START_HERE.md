# 🚀 START HERE - EcoImpact AI Integration

## ✅ Current Status

All fixes have been applied! Your models are ready.

**Verified Files:**
- ✅ `backend/models/revenue_model_gb.pkl` (1551.82 KB)
- ✅ `backend/models/success_model_gb.pkl` (261.96 KB)
- ✅ `backend/encoders/encoders_direct.pkl` (537 bytes)
- ✅ `backend/encoders/encoders_success.pkl` (566 bytes)

## Quick Start (3 Steps)

### Step 1: Start FastAPI Backend

```powershell
cd D:\Fyp\FYP-EcoImpact\backend
.\venv\Scripts\Activate.ps1
uvicorn app:app --reload --port 8000
```

**Expected Output:**
```
✓ Loaded revenue model from ... (1551.8 KB)
✓ Loaded success model from ... (261.9 KB)
✓ Loaded encoders_direct from ... (537 bytes)
✓ Loaded encoders_success from ... (566 bytes)
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Verify Backend (New Terminal)

```powershell
curl http://localhost:8000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "models_loaded": true,
  "message": "Server is running - Models ready"
}
```

### Step 3: Start Frontend (New Terminal)

```powershell
cd D:\Fyp\FYP-EcoImpact\frontend
npm start
```

Then navigate to: `http://localhost:3000/simulate`

## Test Prediction (Optional)

```powershell
$body = @{
    duration = 5
    policyType = "carbonTax"
    carbonPrice = 50
    country = "United States"
    year = 2024
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/predict/all" -Method Post -Body $body -ContentType "application/json"
```

## Troubleshooting

### Backend won't start?

1. **Check if port 8000 is in use:**
   ```powershell
   Get-NetTCPConnection -LocalPort 8000
   ```
   If occupied, kill the process or use a different port.

2. **Check venv activation:**
   ```powershell
   cd D:\Fyp\FYP-EcoImpact\backend
   .\venv\Scripts\Activate.ps1
   python --version  # Should show Python 3.11.9
   ```

3. **Check models exist:**
   ```powershell
   Get-ChildItem D:\Fyp\FYP-EcoImpact\backend\models\*.pkl
   Get-ChildItem D:\Fyp\FYP-EcoImpact\backend\encoders\*.pkl
   ```

### Health endpoint shows `models_loaded: false`?

1. Check startup logs for errors
2. Verify model files exist and are not 0 bytes
3. Re-copy models if needed:
   ```powershell
   cd D:\Fyp\FYP-EcoImpact\backend
   .\venv\Scripts\python.exe scripts\copy_models.py
   ```

### Frontend shows "Failed to fetch"?

1. Ensure FastAPI is running on port 8000
2. Check browser console for detailed error
3. Verify health endpoint: `http://localhost:8000/api/health`

## Documentation

- **Complete Guide**: `INTEGRATION_COMPLETE.md`
- **Save Models**: `backend/SAVE_MODELS.md`
- **Quick Test**: `backend/QUICK_TEST.md`
- **Fixes Applied**: `backend/FIXES_APPLIED.md`

## Ports

- **Frontend**: `http://localhost:3000`
- **Node.js Backend**: `http://localhost:5000`
- **FastAPI Backend**: `http://localhost:8000`

---

**Ready to go!** Start with Step 1 above. 🎉


