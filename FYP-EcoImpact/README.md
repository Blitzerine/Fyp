# FYP Eco-Impact Project

A comprehensive Climate Policy Simulator application with AI-powered predictions, built with React frontend and machine learning models.

## Project Structure

```
FYP-EcoImpact/
├── frontend/              # React frontend application
│   ├── public/            # Static assets
│   │   └── index.html     # Main HTML entry point
│   ├── src/               # Source code
│   │   ├── components/    # Reusable React components
│   │   │   ├── Navbar.js
│   │   │   └── SearchableCountrySelect.js
│   │   ├── pages/         # Page components (routes)
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Simulate.js
│   │   │   ├── SimulateResults.js
│   │   │   ├── Compare.js
│   │   │   └── CompareResults.js
│   │   ├── images/        # Image assets
│   │   ├── styles/        # CSS styles (optional organization)
│   │   ├── App.js         # Main app component with routing
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Dependencies and scripts
│   └── package-lock.json  # Lock file
│
├── backend/               # Express.js backend API
│   ├── config/            # Configuration files
│   │   └── database.js    # MongoDB connection
│   ├── controllers/       # Route controllers
│   │   ├── authController.js
│   │   ├── simulateController.js
│   │   └── compareController.js
│   ├── middleware/        # Express middleware
│   │   └── auth.js        # JWT authentication
│   ├── models/            # Database models
│   │   └── User.js        # User model
│   ├── routes/            # API routes
│   │   ├── auth.js        # Auth routes
│   │   ├── simulate.js    # Simulation routes
│   │   └── compare.js     # Comparison routes
│   ├── services/          # Business logic services
│   │   └── mlService.js   # ML model integration
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
│
└── ai-model/              # AI/ML model files and datasets
    ├── dataset/           # All datasets used for training
    │   ├── annual_co2_per_country/
    │   ├── dataset converted to csv format/
    │   ├── energy mix dataset/
    │   ├── gdp data/
    │   ├── population dataset/
    │   ├── processed/     # Processed/merged datasets
    │   └── wgi data/
    ├── ML Model/          # Machine learning notebooks
    │   ├── model.ipynb
    │   ├── data_preparation_and_merging.ipynb
    │   └── model_metadata.json
    └── Dataset_Analysis_Report.md
```

## Frontend Architecture

### URL Routing

The application uses React Router for client-side routing. All routes are defined in `frontend/src/App.js`:

- `/` - Home page
- `/signup` - User signup page
- `/login` - User login page
- `/simulate` - Policy simulation input page
- `/simulate/results` - Simulation results display
- `/compare` - Policy comparison input page
- `/compare/results` - Comparison results display

### Component Structure

- **Components**: Reusable UI components (Navbar, SearchableCountrySelect)
- **Pages**: Full page components that correspond to routes
- **Styles**: Global CSS styles (currently in `index.css`, can be organized into `styles/` folder)

### File Organization

Instead of a single large HTML file, the application is organized into:
- Multiple React components (one per component/page)
- Separate CSS file for styles
- Organized folder structure for images, components, and pages
- Clear separation of concerns

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The app will run on `http://localhost:3000`

4. Build for production:
   ```bash
   npm run build
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
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

4. Make sure MongoDB is running (or update MONGODB_URI to your database)

5. Start the backend server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

   The API will run on `http://localhost:5000`

### AI Model

The AI model files are located in `ai-model/ML Model/` directory. These Jupyter notebooks contain:
- Data preparation and merging scripts
- Machine learning model training code
- Model metadata

## Technologies Used

### Frontend
- **React** 18.2.0 - UI framework
- **React Router DOM** 6.30.2 - Client-side routing
- **React Scripts** 5.0.1 - Build tooling

### Backend
- **Express.js** - Web framework
- **MongoDB** with **Mongoose** - Database
- **JWT** (jsonwebtoken) - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### AI/ML
- Jupyter Notebooks for model development
- Various datasets for climate and economic data

## Features

1. **Policy Simulation**: Input climate policy parameters and simulate their impact
2. **Policy Comparison**: Compare multiple policy scenarios
3. **User Authentication**: Secure signup and login with JWT tokens
4. **Searchable Country Select**: Easy country selection with search
5. **Responsive Design**: Mobile-friendly interface
6. **RESTful API**: Clean backend API with proper routing
7. **ML Integration**: Service layer ready for ML model integration

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

## Development Notes

- The frontend uses a component-based architecture
- Routing is handled client-side with React Router
- All styles are currently in `index.css` but can be split into separate files in `styles/` folder
- The application follows a modern React structure with hooks and functional components

## Next Steps

1. Consider splitting `index.css` into separate CSS modules or files:
   - `styles/base.css` - Reset, typography, global styles
   - `styles/components.css` - Component-specific styles
   - `styles/pages.css` - Page-specific styles
   - `styles/responsive.css` - Media queries

2. Add environment configuration files (`.env`) for API endpoints
3. Set up backend API integration if needed
4. Add testing framework (Jest, React Testing Library)

