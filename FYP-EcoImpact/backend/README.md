# Backend API - FYP Eco-Impact

Express.js backend API for the Climate Policy Simulator application.

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── simulateController.js # Simulation logic
│   └── compareController.js  # Comparison logic
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   └── User.js              # User model (MongoDB)
├── routes/
│   ├── auth.js              # Auth routes
│   ├── simulate.js          # Simulation routes
│   └── compare.js           # Comparison routes
├── services/
│   └── mlService.js         # ML model integration service
├── server.js                # Main server file
├── package.json
└── .env                     # Environment variables (create from .env.example)
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Simulation
- `POST /api/simulate` - Run a single policy simulation (Protected)

### Comparison
- `POST /api/compare` - Compare two policies (Protected)

### Health Check
- `GET /api/health` - Server health check

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the backend directory:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
MONGODB_URI=mongodb://localhost:27017/ecoimpact
ML_MODEL_SERVICE_URL=http://localhost:8000
PYTHON_PATH=python3
```

3. Make sure MongoDB is running (or update MONGODB_URI to your database)

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000`

## ML Model Integration

The backend includes an ML service (`services/mlService.js`) that can:
1. Call Python scripts directly
2. Connect to a separate ML model API service
3. Use mock data for testing

To integrate your actual ML model, update the `mlService.js` file and replace the mock calls with actual model predictions.

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration (default: 7d)
- `MONGODB_URI` - MongoDB connection string
- `ML_MODEL_SERVICE_URL` - ML model service URL (if separate)
- `PYTHON_PATH` - Python executable path





