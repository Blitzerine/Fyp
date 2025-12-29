# Quick Start FastAPI - Step by Step

## ✅ Start FastAPI (Copy & Paste These Commands)

### Step 1: Open PowerShell/Terminal

### Step 2: Navigate to Backend Directory
```powershell
cd D:\Fyp\FYP-EcoImpact\backend
```

### Step 3: Activate Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```

If that doesn't work, try:
```powershell
.\.venv\Scripts\Activate.ps1
```

### Step 4: Start FastAPI
```powershell
uvicorn app:app --reload --port 8000
```

## ✅ What You Should See

If successful, you'll see output like:
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

## 🧪 Test It's Working

**Once you see "Application startup complete":**

1. **Open in browser:** http://localhost:8000/docs
   - Should show FastAPI interactive documentation

2. **Or test health endpoint:** http://localhost:8000/api/health
   - Should show: `{"status": "OK", "message": "Server is running"}`

3. **Or test root:** http://localhost:8000/
   - Should show API info

## ❌ If You See Errors

### Error: "Could not import module 'app'"
- Make sure you're in `D:\Fyp\FYP-EcoImpact\backend` directory
- Check `app.py` exists: `dir app.py`

### Error: "ModuleNotFoundError"
- Make sure virtual environment is activated
- Install packages: `pip install -r requirements.txt`

### Error: "Models not found"
- Verify files exist:
  - `backend/models/revenue_model_gb.pkl`
  - `backend/models/success_model_gb.pkl`
  - `backend/encoders/encoders_direct.pkl`
  - `backend/encoders/encoders_success.pkl`

### Nothing Shows in Browser
- Make sure FastAPI is running (check terminal output)
- Try: http://127.0.0.1:8000/docs (instead of localhost)
- Check firewall/antivirus isn't blocking port 8000


