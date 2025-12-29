# Testing the FastAPI Backend

## Prerequisites

1. Make sure the FastAPI server is running:
   ```bash
   cd backend
   uvicorn app:app --reload --port 8000
   ```

2. Ensure models and encoders are saved (see `SAVE_MODELS.md`)

## Test Commands

### 1. Health Check

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{"status":"OK","message":"Server is running"}
```

### 2. Simulate Policy (No Auth)

#### Using policy_type (snake_case - recommended):
```bash
curl -X POST "http://localhost:8000/api/simulate" ^
  -H "Content-Type: application/json" ^
  -d "{\"country\":\"Pakistan\",\"policy_type\":\"Carbon Tax\",\"carbon_price\":10,\"duration\":5}"
```

#### Using policyType (camelCase - also supported):
```bash
curl -X POST "http://localhost:8000/api/simulate" ^
  -H "Content-Type: application/json" ^
  -d "{\"country\":\"Pakistan\",\"policyType\":\"carbonTax\",\"carbonPrice\":10,\"duration\":5}"
```

#### Example with ETS:
```bash
curl -X POST "http://localhost:8000/api/simulate" ^
  -H "Content-Type: application/json" ^
  -d "{\"country\":\"United States\",\"policy_type\":\"ETS\",\"carbon_price\":50,\"duration\":10}"
```

### 3. Using PowerShell (Windows)

If curl doesn't work, use PowerShell's `Invoke-RestMethod`:

```powershell
$body = @{
    country = "Pakistan"
    policy_type = "Carbon Tax"
    carbon_price = 10
    duration = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/simulate" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### 4. Using Python requests

```python
import requests

url = "http://localhost:8000/api/simulate"
data = {
    "country": "Pakistan",
    "policy_type": "Carbon Tax",
    "carbon_price": 10,
    "duration": 5
}

response = requests.post(url, json=data)
print(response.json())
```

### 5. Using the Interactive API Docs

1. Start the server
2. Open your browser: `http://localhost:8000/docs`
3. Click on `/api/simulate` endpoint
4. Click "Try it out"
5. Fill in the request body:
   ```json
   {
     "country": "Pakistan",
     "policy_type": "Carbon Tax",
     "carbon_price": 10,
     "duration": 5
   }
   ```
6. Click "Execute"

## Expected Response Format

```json
{
  "success": true,
  "inputs": {
    "duration": 5,
    "policy_type": "Carbon Tax",
    "carbon_price": 10.0,
    "country": "Pakistan",
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

## Common Issues

### Error: "ML models not loaded"
- **Solution**: Save your models first (see `SAVE_MODELS.md`)
- Ensure files exist:
  - `backend/models/revenue_model_gb.pkl`
  - `backend/models/success_model_gb.pkl`
  - `backend/encoders/encoders_direct.pkl`
  - `backend/encoders/encoders_success.pkl`

### Error: "Cannot connect to server"
- **Solution**: Make sure the server is running on port 8000
- Check: `uvicorn app:app --reload --port 8000`

### Error: "Validation error"
- **Solution**: Check your JSON format
- Ensure all required fields are present: `country`, `policy_type`, `carbon_price`, `duration`

## Testing with Authentication (Future)

Once authentication is implemented, add the token header:

```bash
curl -X POST "http://localhost:8000/api/simulate" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"country\":\"Pakistan\",\"policy_type\":\"Carbon Tax\",\"carbon_price\":10,\"duration\":5}"
```




