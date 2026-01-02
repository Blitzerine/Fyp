# Network Error Troubleshooting Guide

## Common Causes of Network Errors

### 1. **Backend Not Running** (Most Common)
The frontend tries to connect to `http://localhost:8000` but the backend isn't running.

**Solution:**
```powershell
# Open a new PowerShell terminal
cd D:\Fyp\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Check if backend is running:**
- Open browser: http://localhost:8000
- Should see: `{"message":"EcoImpact AI Backend - Ready"}`
- Or check: http://localhost:8000/health

---

### 2. **Missing .env File**
Backend requires `.env` file with database connection.

**Solution:**
- File location: `D:\Fyp\backend\.env`
- Content needed:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecoimpact
```

**For Supabase (recommended):**
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

---

### 3. **Database Connection Failed**
Backend might start but fail when accessing database features.

**Quick Test (without database):**
The backend should still start even if database connection fails initially. Check the terminal for error messages.

**If you don't have PostgreSQL:**
- Use Supabase (free): https://supabase.com
- Or install PostgreSQL locally
- Or use SQLite for testing (requires code changes)

---

### 4. **Port Already in Use**
Another application is using port 8000.

**Solution:**
```powershell
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID [PID] /F

# Or run backend on different port
uvicorn app.main:app --reload --port 8001
# Then update frontend API_BASE_URL to http://localhost:8001
```

---

### 5. **CORS Issues**
Frontend can't connect due to CORS policy.

**Check:** Backend CORS is configured for `http://localhost:5173` in `backend/app/main.py`

**If frontend runs on different port:**
- Update CORS in `backend/app/main.py`:
```python
allow_origins=["http://localhost:5173", "http://localhost:3000"]  # Add your port
```

---

### 6. **Frontend Not Running**
Backend is running but frontend isn't.

**Solution:**
```powershell
# Open a new PowerShell terminal
cd D:\Fyp\frontend
npm run dev
```

---

## Step-by-Step Fix

### Step 1: Check Backend Status
```powershell
# Test if backend responds
curl http://localhost:8000/health
# Or open in browser: http://localhost:8000
```

### Step 2: Check .env File
```powershell
cd D:\Fyp\backend
Get-Content .env
# Should show: DATABASE_URL=postgresql://...
```

### Step 3: Start Backend
```powershell
cd D:\Fyp\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Look for these messages:**
- ✅ `Uvicorn running on http://0.0.0.0:8000`
- ✅ `Application startup complete`
- ⚠️ `Database initialization warning` (OK if you don't have DB yet)

### Step 4: Start Frontend
```powershell
# In a NEW terminal
cd D:\Fyp\frontend
npm run dev
```

**Look for:**
- ✅ `Local: http://localhost:5173/`

### Step 5: Test Connection
1. Open browser: http://localhost:5173
2. Open browser DevTools (F12)
3. Check Console tab for errors
4. Check Network tab - look for failed requests to `localhost:8000`

---

## Quick Diagnostic Commands

```powershell
# Check if backend port is listening
netstat -ano | findstr :8000

# Check if frontend port is listening  
netstat -ano | findstr :5173

# Test backend health endpoint
Invoke-WebRequest -Uri http://localhost:8000/health

# Check .env file exists
Test-Path D:\Fyp\backend\.env

# View .env content
Get-Content D:\Fyp\backend\.env
```

---

## Common Error Messages

### "Network error. Please check your connection"
- **Cause:** Backend not running or unreachable
- **Fix:** Start backend server

### "Failed to fetch"
- **Cause:** Backend not running, wrong URL, or CORS issue
- **Fix:** Check backend is running on port 8000

### "DATABASE_URL not found"
- **Cause:** Missing or incorrect .env file
- **Fix:** Create `.env` file in `backend/` folder

### "Connection refused"
- **Cause:** Backend not running
- **Fix:** Start backend server

---

## Still Having Issues?

1. **Check both terminals are running:**
   - Terminal 1: Backend (port 8000)
   - Terminal 2: Frontend (port 5173)

2. **Check browser console:**
   - Press F12 in browser
   - Look at Console and Network tabs
   - Share error messages

3. **Check backend terminal:**
   - Look for error messages
   - Check if server started successfully

4. **Verify URLs:**
   - Backend: http://localhost:8000
   - Frontend: http://localhost:5173
   - API calls should go to: http://localhost:8000

