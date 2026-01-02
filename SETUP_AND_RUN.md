# EcoImpact AI - Setup and Run Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 18+ and npm installed
- PostgreSQL database (or Supabase account)
- Git (already installed)

---

## Step 1: Backend Setup

### 1.1 Navigate to backend directory
```powershell
cd backend
```

### 1.2 Create Python virtual environment
```powershell
python -m venv venv
```

### 1.3 Activate virtual environment
```powershell
.\venv\Scripts\Activate.ps1
```

### 1.4 Install Python dependencies
```powershell
pip install -r requirements.txt
```

### 1.5 Create .env file
Create a file named `.env` in the `backend` directory with the following content:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

**For Supabase:**
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

**For local PostgreSQL:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecoimpact
```

### 1.6 Initialize database (optional - creates tables)
```powershell
python init_db.py
```

---

## Step 2: Frontend Setup

### 2.1 Navigate to frontend directory (from project root)
```powershell
cd frontend
```

### 2.2 Install Node.js dependencies
```powershell
npm install
```

---

## Step 3: Running the Application

### 3.1 Start Backend Server

**Open a new terminal/PowerShell window:**

```powershell
cd D:\Fyp\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Or using Python module:**
```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on: **http://localhost:8000**
- API Docs: **http://localhost:8000/docs**
- Health Check: **http://localhost:8000/health**

### 3.2 Start Frontend Server

**Open another new terminal/PowerShell window:**

```powershell
cd D:\Fyp\frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## Quick Start Commands (All in One)

### Terminal 1 - Backend:
```powershell
cd D:\Fyp\backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000
```

### Terminal 2 - Frontend:
```powershell
cd D:\Fyp\frontend; npm run dev
```

---

## Troubleshooting

### Backend Issues:

**If virtual environment activation fails:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**If models are missing:**
- Make sure ML model files (.pkl) are in the correct location
- Check that `backend/app/predict.py` can find the model files

**If database connection fails:**
- Verify DATABASE_URL in `.env` file
- Check if PostgreSQL/Supabase is running
- Test connection: `python init_db.py`

### Frontend Issues:

**If npm install fails:**
```powershell
npm cache clean --force
npm install
```

**If port 5173 is already in use:**
```powershell
npm run dev -- --port 3000
```

**If backend connection fails:**
- Check backend is running on port 8000
- Verify CORS settings in `backend/app/main.py`
- Check browser console for errors

---

## Development Commands

### Backend:
- **Run with auto-reload:** `uvicorn app.main:app --reload`
- **Run on specific port:** `uvicorn app.main:app --port 8001`
- **Run with debug:** `uvicorn app.main:app --reload --log-level debug`

### Frontend:
- **Development server:** `npm run dev`
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`
- **Lint code:** `npm run lint`

---

## Environment Variables Needed

### Backend (.env file):
- `DATABASE_URL` - PostgreSQL connection string (required)

### Optional (if using email service):
- `RESEND_API_KEY` - For email verification (if implemented)
- `JWT_SECRET_KEY` - For JWT token signing (if not using default)

---

## Project Structure

```
D:\Fyp\
├── backend/
│   ├── app/          # FastAPI application
│   ├── venv/         # Python virtual environment
│   ├── .env          # Environment variables (create this)
│   └── requirements.txt
├── frontend/
│   ├── src/          # React source code
│   └── package.json
├── dataset/          # Data files
└── ML Model/         # Jupyter notebooks
```

---

## Next Steps

1. ✅ Set up backend with database
2. ✅ Install frontend dependencies
3. ✅ Add ML model files (when ready)
4. ✅ Configure .env file
5. ✅ Run both servers
6. ✅ Test the application

---

## Notes

- Backend runs on **port 8000** (default FastAPI)
- Frontend runs on **port 5173** (default Vite)
- CORS is configured to allow `http://localhost:5173`
- Database tables are auto-created on first run
- ML models need to be placed in the correct directory (will be specified when you share them)

