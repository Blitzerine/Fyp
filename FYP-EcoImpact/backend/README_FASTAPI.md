# FastAPI Backend Setup

## Overview

This is a Python FastAPI backend for the EcoImpact AI policy simulation API. It uses the trained ML models to predict policy outcomes.

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or use a virtual environment (recommended):

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Ensure Models and Encoders are Saved

Make sure you've saved your models from the Jupyter notebook:
- `backend/models/revenue_model_gb.pkl`
- `backend/models/success_model_gb.pkl`
- `backend/encoders/encoders_direct.pkl`
- `backend/encoders/encoders_success.pkl`

See `SAVE_MODELS.md` for instructions.

### 3. Start the Server

```bash
# Option 1: Using uvicorn directly
uvicorn app:app --reload --port 8000

# Option 2: Run the app directly
python app.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### POST /api/simulate

Simulate a climate policy and get predictions.

**Request Body:**
```json
{
  "duration": 5,
  "policyType": "carbonTax",
  "carbonPrice": 50.0,
  "country": "United States",
  "year": 2024
}
```

**Response:**
```json
{
  "success": true,
  "inputs": {
    "duration": 5,
    "policyType": "carbonTax",
    "carbonPrice": 50.0,
    "country": "United States",
    "year": 2024
  },
  "success_probability": 0.85,
  "risk_level": "low",
  "status": "Low Risk",
  "yearly_predictions": [
    {
      "year": 2024,
      "revenue_million_usd": 1250.5,
      "coverage": null,
      "co2_reduction_percent": null,
      "gdp_impact": null
    },
    ...
  ],
  "overall_revenue": 6250.0,
  "overall_co2_reduction": null
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Development

### Running in Development Mode

```bash
uvicorn app:app --reload --port 8000
```

The `--reload` flag enables auto-reload on code changes.

### Testing the API

You can test using curl:

```bash
curl -X POST "http://localhost:8000/api/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 5,
    "policyType": "carbonTax",
    "carbonPrice": 50.0,
    "country": "United States"
  }'
```

Or use the interactive API docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Integration with Node.js Backend

The FastAPI backend runs on port 8000, while the Node.js backend runs on port 5000. You can:

1. **Run both separately** - Node.js handles auth, FastAPI handles ML predictions
2. **Update Node.js mlService** to call FastAPI instead of Python scripts
3. **Replace Node.js backend** entirely with FastAPI (add auth later)

## Notes

- Models are loaded lazily (on first request)
- Make sure all data CSV files are in `backend/data/`
- Update `utils/country_mapper.py` with your region and income group mappings
- Adjust `utils/data_loader.py` column names to match your CSV structure




