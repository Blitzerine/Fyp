# Port Configuration - Which Service Runs Where?

## 🎯 Port Summary

Your project has **3 different services** running on different ports:

### 1. **Frontend (React)** - Port **3000**
- **What it is:** Your React web application (the user interface)
- **How to start:**
  ```bash
  cd frontend
  npm start
  ```
- **Access:** http://localhost:3000
- **Purpose:** The website users see and interact with

---

### 2. **Node.js Backend (Express)** - Port **5000**
- **What it is:** Node.js/Express server for authentication and other services
- **How to start:**
  ```bash
  cd backend
  npm start
  ```
- **Access:** http://localhost:5000
- **Endpoints:**
  - `/api/auth/login` - User login
  - `/api/auth/signup` - User signup
  - `/api/health` - Health check
- **Purpose:** Handles user authentication, database operations

---

### 3. **FastAPI Backend (Python ML)** - Port **8000**
- **What it is:** Python FastAPI server for ML model predictions
- **How to start:**
  ```bash
  cd backend
  .\venv\Scripts\Activate.ps1
  uvicorn app:app --reload --port 8000
  ```
- **Access:** http://localhost:8000
- **Endpoints:**
  - `/api/health` - Health check
  - `/api/simulate` - Policy simulation (ML predictions)
  - `/predict/all` - Alias for simulate
- **Purpose:** Provides ML model predictions for policy simulation

---

## 🔗 How They Connect

```
User Browser (Port 3000)
    ↓
Frontend React App
    ↓
    ├─→ Node.js Backend (Port 5000) - For login/auth
    └─→ FastAPI Backend (Port 8000) - For ML predictions
```

**Frontend connects to:**
- Port 5000: For authentication (`/api/auth/login`)
- Port 8000: For ML predictions (`/predict/all`)

---

## ✅ Which Health Endpoint Should You Check?

**Both have `/api/health` endpoints:**

1. **Node.js Backend:** http://localhost:5000/api/health
2. **FastAPI Backend:** http://localhost:8000/api/health

**For ML predictions, you need FastAPI on port 8000!**

---

## 🚀 Quick Start All Services

### Terminal 1: Frontend
```bash
cd frontend
npm start
```
→ Runs on http://localhost:3000

### Terminal 2: Node.js Backend
```bash
cd backend
npm start
```
→ Runs on http://localhost:5000

### Terminal 3: FastAPI Backend
```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app:app --reload --port 8000
```
→ Runs on http://localhost:8000

---

## 🧪 Test Each Service

1. **Frontend:** http://localhost:3000
   - Should show your React app

2. **Node.js Backend:** http://localhost:5000/api/health
   - Should return: `{"status": "OK", "message": "Server is running"}`

3. **FastAPI Backend:** http://localhost:8000/api/health
   - Should return: `{"status": "OK", "message": "Server is running"}`
   - Or check: http://localhost:8000/docs (interactive API docs)

---

## ❓ Which Port Should You Use?

**For ML predictions (Simulate page):**
- ✅ Use **port 8000** (FastAPI)
- This is what your frontend connects to for predictions

**For authentication (Login/Signup):**
- ✅ Use **port 5000** (Node.js)
- This handles user login/signup

**For viewing the website:**
- ✅ Use **port 3000** (Frontend)
- This is your main website


