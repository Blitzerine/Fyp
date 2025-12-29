# Next Steps After Running Notebook

## ✅ Current Status
- Notebook is running successfully
- Models have been trained
- **BUT:** Models/encoders may not be fully saved to backend/

## 📋 Step-by-Step Checklist

### Step 1: Verify All Models Are Saved ✅

Check that these files exist in `backend/`:
- ✅ `backend/models/revenue_model_gb.pkl` (EXISTS)
- ❌ `backend/models/success_model_gb.pkl` (MISSING - need to save)
- ❌ `backend/encoders/encoders_direct.pkl` (MISSING - need to save)
- ❌ `backend/encoders/encoders_success.pkl` (MISSING - need to save)

### Step 2: Save Models & Encoders from Notebook

If models are not saved yet, you need to save them:

1. **In your notebook**, find the "SAVE MODELS" cell (usually near the end)
2. **Make sure you've run ALL training cells first** (to ensure variables like `gb_direct`, `gb_success_final`, `encoders_direct`, `encoders_success` are defined)
3. **Run the save cell** - it should save to:
   - `backend/models/revenue_model_gb.pkl`
   - `backend/models/success_model_gb.pkl`
   - `backend/encoders/encoders_direct.pkl`
   - `backend/encoders/encoders_success.pkl`

**Quick Save Code (if save cell doesn't exist):**

```python
import pickle
from pathlib import Path

# Set paths
models_dir = Path('../../backend/models')
encoders_dir = Path('../../backend/encoders')

models_dir.mkdir(parents=True, exist_ok=True)
encoders_dir.mkdir(parents=True, exist_ok=True)

# Save Revenue Model
with open(models_dir / 'revenue_model_gb.pkl', 'wb') as f:
    pickle.dump(gb_direct, f)
print("✅ Saved revenue_model_gb.pkl")

# Save Success Model
with open(models_dir / 'success_model_gb.pkl', 'wb') as f:
    pickle.dump(gb_success_final, f)
print("✅ Saved success_model_gb.pkl")

# Save Revenue Encoders
with open(encoders_dir / 'encoders_direct.pkl', 'wb') as f:
    pickle.dump(encoders_direct, f)
print("✅ Saved encoders_direct.pkl")

# Save Success Encoders
with open(encoders_dir / 'encoders_success.pkl', 'wb') as f:
    pickle.dump(encoders_success, f)
print("✅ Saved encoders_success.pkl")
```

### Step 3: Verify Files Are Saved ✅

Check that all 4 files exist:
```bash
# Windows PowerShell
cd backend
dir models
dir encoders
```

You should see:
- `models/revenue_model_gb.pkl`
- `models/success_model_gb.pkl`
- `encoders/encoders_direct.pkl`
- `encoders/encoders_success.pkl`

### Step 4: Restart FastAPI Backend 🔄

**IMPORTANT:** FastAPI loads models when it starts, so you MUST restart it after saving new models.

1. **Stop FastAPI** (if running):
   - In terminal running FastAPI, press `Ctrl+C`

2. **Start FastAPI**:
   ```bash
   cd backend
   uvicorn app:app --reload --port 8000
   ```

3. **Check startup messages** - you should see:
   ```
   ✓ Loaded revenue model from backend/models/revenue_model_gb.pkl
   ✓ Loaded success model from backend/models/success_model_gb.pkl
   ✓ Loaded encoders from backend/encoders/encoders_direct.pkl
   ✓ Loaded encoders from backend/encoders/encoders_success.pkl
   ```

   If you see warnings like "Models not found", check Step 2 again.

### Step 5: Test the Connection 🧪

1. **Check FastAPI is running**:
   - Open browser: http://localhost:8000
   - Should see API docs

2. **Test health endpoint**:
   - http://localhost:8000/api/health
   - Should return: `{"status": "OK", "message": "Server is running"}`

3. **Test prediction endpoint** (optional):
   - Use the API docs at http://localhost:8000/docs
   - Try POST `/api/simulate` with sample data

### Step 6: Connect Frontend 🌐

Once FastAPI is running with models loaded:

1. **Frontend should already be configured** (we set this up earlier):
   - `frontend/.env` has `VITE_API_BASE_URL=http://localhost:8000`
   - Frontend uses `frontend/src/utils/api.js` which automatically connects

2. **If frontend isn't running**, start it:
   ```bash
   cd frontend
   npm start
   # or
   npm run dev  # if using Vite
   ```

3. **Test on Simulate page**:
   - Go to http://localhost:5173 (or 3000)
   - Navigate to "Simulate" page
   - Fill out the form and click "SIMULATE"
   - Should get **real predictions** (not mock data)

### Step 7: Verify Everything Works ✅

✅ FastAPI running on port 8000
✅ Models loaded successfully (check startup logs)
✅ Frontend running (port 5173 or 3000)
✅ Can make predictions on Simulate page
✅ No more "Using mock data" banner

## 🐛 Troubleshooting

### Problem: "Models not found" when starting FastAPI

**Solution:**
1. Verify files exist in `backend/models/` and `backend/encoders/`
2. Check file names match exactly (case-sensitive)
3. Restart FastAPI

### Problem: Frontend shows "Failed to fetch" or connection error

**Solution:**
1. Verify FastAPI is running: http://localhost:8000/api/health
2. Check CORS is configured in `backend/app.py`
3. Verify frontend `.env` has correct `VITE_API_BASE_URL`
4. Check browser console for errors

### Problem: Predictions return errors

**Solution:**
1. Check FastAPI terminal for error messages
2. Verify models loaded successfully (check startup logs)
3. Verify all 4 files (2 models + 2 encoders) exist
4. Try a simple test request in API docs

## 📝 Quick Reference

**FastAPI Start Command:**
```bash
cd backend
uvicorn app:app --reload --port 8000
```

**Frontend Start Command:**
```bash
cd frontend
npm start  # or npm run dev
```

**Check Models:**
```bash
cd backend
dir models
dir encoders
```

**Test API:**
- Health: http://localhost:8000/api/health
- Docs: http://localhost:8000/docs


