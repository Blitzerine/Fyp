# Quick Start Guide - Servers Running

## ✅ Servers Started

I've started both servers in separate PowerShell windows:

### Backend Server
- **Status**: Running in separate window
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Frontend Server  
- **Status**: Running in separate window
- **URL**: http://localhost:5173

---

## 🌐 Access Your Application

1. **Open your browser** and go to: **http://localhost:5173**
2. The frontend will automatically connect to the backend

---

## 📊 Check Server Status

### Backend Health Check:
```powershell
Invoke-WebRequest http://localhost:8000/health
```

### Or open in browser:
- http://localhost:8000/health
- http://localhost:8000/docs (API documentation)

---

## ⚠️ Important Notes

### Database Setup
The backend is configured to work with PostgreSQL. You have two options:

#### Option 1: Use Supabase (Recommended - Free)
1. Sign up at https://supabase.com
2. Create a new project
3. Get your database connection string
4. Update `backend/.env`:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

#### Option 2: Local PostgreSQL
1. Install PostgreSQL
2. Create database: `ecoimpact`
3. Update `backend/.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecoimpact
```

#### Initialize Database (after setting up):
```powershell
cd D:\Fyp\backend
.\venv\Scripts\Activate.ps1
python init_db.py
```

---

## 🤖 ML Model Files

**Note**: The backend will start even without ML model files, but predictions will use fallback formulas.

When you're ready to add ML models, place these files in `ML Model/` folder:
- `revenue_model_gb.pkl`
- `revenue_encoders.pkl`
- `success_model_gb.pkl`
- `success_encoders.pkl`

After adding the files, restart the backend server.

---

## 🛑 Stopping Servers

To stop the servers:
1. Close the PowerShell windows that are running the servers
2. Or press `Ctrl+C` in each terminal

---

## 🔧 Troubleshooting

### Backend not responding?
- Check the backend PowerShell window for error messages
- Verify `.env` file exists in `backend/` folder
- Check if port 8000 is already in use:
  ```powershell
  netstat -ano | findstr :8000
  ```

### Frontend not loading?
- Check the frontend PowerShell window for error messages
- Verify `node_modules` are installed:
  ```powershell
  cd D:\Fyp\frontend
  npm install
  ```

### Network errors in browser?
- Make sure both servers are running
- Check browser console (F12) for specific error messages
- Verify backend is accessible: http://localhost:8000/health

---

## 📝 Next Steps

1. ✅ Servers are running
2. ⏳ Set up database (Supabase or local PostgreSQL)
3. ⏳ Add ML model files when ready
4. ✅ Start using the application!

---

## 🎯 Quick Commands Reference

### Restart Backend:
```powershell
cd D:\Fyp\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### Restart Frontend:
```powershell
cd D:\Fyp\frontend
npm run dev
```

### Check if servers are running:
```powershell
netstat -ano | findstr ":8000 :5173"
```

