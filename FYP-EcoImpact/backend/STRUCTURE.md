# Backend Structure

This backend contains both Node.js (Express) and Python components:

## Node.js Backend (Express.js)

```
backend/
├── config/
│   └── database.js           # MongoDB connection
├── db_models/                # Database models (Mongoose)
│   └── User.js               # User model for authentication
├── controllers/              # Route controllers
│   ├── authController.js
│   ├── simulateController.js
│   └── compareController.js
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── routes/                   # API routes
│   ├── auth.js
│   ├── simulate.js
│   └── compare.js
├── services/
│   └── mlService.js          # ML model integration service
└── server.js                 # Express server entry point
```

## Python ML Components

```
backend/
├── models/                   # ML model .pkl files (TO BE CREATED)
│   ├── revenue_model_gb.pkl
│   └── success_model_gb.pkl
├── encoders/                 # Label encoder .pkl files (TO BE CREATED)
│   ├── encoders_direct.pkl
│   └── encoders_success.pkl
├── data/                     # External lookup CSV files
│   ├── annual_co2_per_country/
│   ├── gdp_data/
│   ├── population_dataset/
│   └── energy_mix_dataset/
└── utils/                    # Python utility modules
    ├── country_mapper.py     # Country name standardization
    ├── data_loader.py        # CSV data loading functions
    └── simulator.py          # ML model prediction logic
```

## Files to Create

You need to create the following files by running your Jupyter notebook:

1. **Models:**
   - `backend/models/revenue_model_gb.pkl`
   - `backend/models/success_model_gb.pkl`

2. **Encoders:**
   - `backend/encoders/encoders_direct.pkl`
   - `backend/encoders/encoders_success.pkl`

See `SAVE_MODELS.md` for instructions on how to save these files from your notebook.




