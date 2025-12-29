# Quick Test Guide

## Test FastAPI Backend

### 1. Check Health Endpoint

```bash
curl http://localhost:8000/api/health
```

Expected:
```json
{
  "status": "ok",
  "models_loaded": true,
  "message": "Server is running - Models ready"
}
```

### 2. Test Prediction Endpoint

```bash
curl -X POST http://localhost:8000/predict/all ^
  -H "Content-Type: application/json" ^
  -d "{\"duration\": 5, \"policyType\": \"carbonTax\", \"carbonPrice\": 50, \"country\": \"United States\"}"
```

Or using PowerShell:
```powershell
$body = @{
    duration = 5
    policyType = "carbonTax"
    carbonPrice = 50
    country = "United States"
    year = 2024
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/predict/all" -Method Post -Body $body -ContentType "application/json"
```

Expected: JSON response with predictions (200 OK)

### 3. Test Error Handling

**Test missing models (should return 503 if models not loaded):**
```bash
# Temporarily rename models directory
mv backend/models backend/models_backup
# Restart FastAPI
# Call /predict/all - should return 503
# Restore: mv backend/models_backup backend/models
```

## Expected File Sizes

```powershell
# Models
Get-ChildItem backend\models\*.pkl | Format-Table Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB, 2)}}

# Encoders  
Get-ChildItem backend\encoders\*.pkl | Format-Table Name, @{Name="Size(bytes)";Expression={$_.Length}}
```

Expected:
- `revenue_model_gb.pkl`: ~1500 KB
- `success_model_gb.pkl`: ~260 KB
- `encoders_direct.pkl`: ~500 bytes
- `encoders_success.pkl`: ~500 bytes
