# How to Start FastAPI Backend

## ✅ Correct Way to Start

**IMPORTANT:** You must run the command from the `backend` directory!

### Step 1: Navigate to Backend Directory

```bash
cd D:\Fyp\FYP-EcoImpact\backend
```

### Step 2: Activate Virtual Environment (if using venv)

**Option A: If using backend venv:**
```bash
.\venv\Scripts\Activate.ps1
```

**Option B: If using a different venv (like .venv):**
```bash
.\.venv\Scripts\Activate.ps1
```

### Step 3: Start FastAPI

```bash
uvicorn app:app --reload --port 8000
```

## ✅ Expected Output

If successful, you should see:
```
INFO:     Will watch for changes in these directories: ['D:\\Fyp\\FYP-EcoImpact\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXX] using WatchFiles
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
✓ Loaded revenue model from backend/models/revenue_model_gb.pkl
✓ Loaded success model from backend/models/success_model_gb.pkl
✓ Loaded encoders from backend/encoders/encoders_direct.pkl
✓ Loaded encoders from backend/encoders/encoders_success.pkl
INFO:     Application startup complete.
```

## ❌ Common Errors

### Error: "Could not import module 'app'"

**Cause:** Running from wrong directory

**Solution:**
1. Make sure you're in `D:\Fyp\FYP-EcoImpact\backend`
2. Verify `app.py` exists: `dir app.py`
3. Run: `uvicorn app:app --reload --port 8000`

### Error: "ModuleNotFoundError" or missing packages

**Solution:**
```bash
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Error: "Models not found"

**Solution:**
- Verify all 4 files exist:
  - `backend/models/revenue_model_gb.pkl`
  - `backend/models/success_model_gb.pkl`
  - `backend/encoders/encoders_direct.pkl`
  - `backend/encoders/encoders_success.pkl`

## 🧪 Test It Works

Once running, open in browser:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

You should see the FastAPI interactive documentation!


