# MongoDB Local Installation Guide

## Option 1: MongoDB Atlas (Cloud - Recommended - No Installation)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a free cluster (M0 - Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)
6. Replace `<password>` with your actual password
7. Add database name at the end: `mongodb+srv://.../ecoimpact?retryWrites=true&w=majority`
8. Update `.env` file: `MONGODB_URI=your-connection-string-here`

## Option 2: Install MongoDB Community Server Locally

### Windows Installation Steps:

1. **Download MongoDB:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI, Latest version
   - Click "Download"

2. **Run Installer:**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Leave default service name: "MongoDB"
   - Install MongoDB Compass (GUI tool - optional but recommended)

3. **Start MongoDB:**
   - After installation, MongoDB should start automatically as a Windows service
   - To verify: Open Services (Win+R, type `services.msc`)
   - Look for "MongoDB" service and make sure it's "Running"

4. **Verify Installation:**
   - Open Command Prompt or PowerShell
   - Run: `mongod --version` (should show version)
   - MongoDB runs on default port 27017

5. **Test Connection:**
   - Your `.env` file already has: `MONGODB_URI=mongodb://localhost:27017/ecoimpact`
   - This should work after MongoDB is installed and running

### If MongoDB Service Doesn't Start:

1. Open Command Prompt as Administrator
2. Navigate to MongoDB bin folder (usually: `C:\Program Files\MongoDB\Server\{version}\bin`)
3. Run: `mongod --install`
4. Run: `net start MongoDB`

## Quick Test After Installation:

After MongoDB is running, restart your backend server:
```bash
cd backend
npm start
```

You should see: "MongoDB Connected: 127.0.0.1" in the console.

