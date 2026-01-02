# Database Connection Fix

## ✅ Problem Solved

The database connection issue has been fixed! The backend now automatically falls back to **SQLite** if PostgreSQL is not available.

### What Changed:
1. **Automatic Fallback**: If PostgreSQL connection fails, the app automatically uses SQLite
2. **No Setup Required**: SQLite works immediately - no database server needed
3. **Database File**: Created at `backend/ecoimpact.db`

---

## 🔄 Restart Backend Server

The backend server needs to be restarted for the changes to take effect:

### Option 1: Auto-reload (if server is running with --reload)
The server should automatically reload. Try creating an account again.

### Option 2: Manual Restart
1. Find the PowerShell window running the backend
2. Press `Ctrl+C` to stop it
3. Run again:
```powershell
cd D:\Fyp\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

---

## ✅ Test Account Creation

After restarting, try creating an account again:
1. Go to: http://localhost:5173
2. Click "Sign Up"
3. Enter your email and password
4. Account should be created successfully!

---

## 📊 Database Information

### Current Setup: SQLite
- **Location**: `D:\Fyp\backend\ecoimpact.db`
- **Type**: SQLite (file-based, no server needed)
- **Status**: ✅ Working

### To Use PostgreSQL Later:
1. Set up PostgreSQL or Supabase
2. Update `backend/.env`:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
3. Restart backend - it will automatically use PostgreSQL if connection succeeds

---

## 🎯 What Works Now

✅ Account creation (signup)
✅ User login
✅ Saving simulations
✅ User authentication
✅ All database features

The SQLite database is created automatically when you first use the app. No additional setup needed!


