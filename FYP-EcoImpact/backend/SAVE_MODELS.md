# Save ML Models - Complete Guide

## Overview

This guide explains how to save trained ML models from your Jupyter notebook to the backend directory so FastAPI can use them.

## Required Files

The FastAPI backend expects these files:

### Models (`backend/models/`)
- `revenue_model_gb.pkl` - Revenue prediction model (GradientBoostingRegressor)
- `success_model_gb.pkl` - Success probability model (GradientBoostingClassifier)

### Encoders (`backend/encoders/`)
- `encoders_direct.pkl` - Label encoders for revenue model features
- `encoders_success.pkl` - Label encoders for success model features

## Method 1: Copy Existing Models (Recommended)

If you've already saved models to `ai-model/ML Model/`, use the copy script:

```bash
cd D:\Fyp\FYP-EcoImpact\backend
.\venv\Scripts\python.exe scripts\copy_models.py
```

This script will:
- Copy `revenue_model_gb.pkl` → `backend/models/revenue_model_gb.pkl`
- Copy `success_model_gb.pkl` → `backend/models/success_model_gb.pkl`
- Copy `revenue_encoders.pkl` → `backend/encoders/encoders_direct.pkl`
- Copy `success_encoders.pkl` → `backend/encoders/encoders_success.pkl`

## Method 2: Save from Jupyter Notebook

If you need to save models directly from the notebook:

1. Open `ai-model/ML Model/model.ipynb`
2. Ensure models are trained (variables `gb_direct` and `gb_success_final` exist)
3. Run this cell:

```python
## Save Models and Encoders to Backend Directory
import pickle
from pathlib import Path

# Set up paths (relative to notebook location)
models_dir = Path('../../backend/models')
encoders_dir = Path('../../backend/encoders')

# Create directories if they don't exist
models_dir.mkdir(parents=True, exist_ok=True)
encoders_dir.mkdir(parents=True, exist_ok=True)

print("="*60)
print("Saving models and encoders to backend...")
print(f"Models directory: {models_dir.absolute()}")
print(f"Encoders directory: {encoders_dir.absolute()}")
print("="*60)

# Save revenue model
revenue_model_path = models_dir / 'revenue_model_gb.pkl'
with open(revenue_model_path, 'wb') as f:
    pickle.dump(gb_direct, f)
print(f"✓ Saved revenue model: {revenue_model_path}")

# Save success model
success_model_path = models_dir / 'success_model_gb.pkl'
with open(success_model_path, 'wb') as f:
    pickle.dump(gb_success_final, f)
print(f"✓ Saved success model: {success_model_path}")

# Save encoders_direct
encoders_direct_path = encoders_dir / 'encoders_direct.pkl'
with open(encoders_direct_path, 'wb') as f:
    pickle.dump(encoders_direct, f)
print(f"✓ Saved encoders_direct: {encoders_direct_path}")

# Save encoders_success
encoders_success_path = encoders_dir / 'encoders_success.pkl'
with open(encoders_success_path, 'wb') as f:
    pickle.dump(encoders_success, f)
print(f"✓ Saved encoders_success: {encoders_success_path}")

print("="*60)
print("All models and encoders saved successfully!")
print("="*60)
```

## Verification

After saving models, verify they exist:

```bash
# Windows PowerShell
cd D:\Fyp\FYP-EcoImpact\backend
Get-ChildItem models\*.pkl | Format-Table Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB, 2)}}
Get-ChildItem encoders\*.pkl | Format-Table Name, @{Name="Size(bytes)";Expression={$_.Length}}
```

Expected output:
```
Name                 Size(KB)
----                 --------
revenue_model_gb.pkl  1500+ (should be > 1000 KB)
success_model_gb.pkl   250+ (should be > 100 KB)

Name                Size(bytes)
----                ----------
encoders_direct.pkl  500+ (should be > 100 bytes)
encoders_success.pkl 500+ (should be > 100 bytes)
```

## Important Notes

### sklearn Version Compatibility

⚠️ **Warning**: Models trained with scikit-learn 1.6.1 will show a warning when loaded with scikit-learn 1.3.2:

```
Trying to unpickle estimator LabelEncoder from version 1.6.1
while using version 1.3.2
```

This is usually safe to ignore, but if you encounter issues:

**Option 1**: Update backend sklearn version (recommended if models work):
```bash
cd backend
.\venv\Scripts\activate
pip install scikit-learn==1.6.1
```

**Option 2**: Retrain models using backend venv sklearn version:
```bash
cd backend
.\venv\Scripts\activate
pip install scikit-learn==1.3.2  # Ensure version matches
# Then retrain and save models
```

### File Size Checks

Models should NOT be 0 bytes:
- `revenue_model_gb.pkl` should be ~1500 KB
- `success_model_gb.pkl` should be ~260 KB
- Encoders should be ~500 bytes each

If files are 0 bytes, they were not saved correctly. Re-run the save cell or copy script.

## Troubleshooting

### Models not loading?

1. **Check file existence**:
   ```bash
   ls backend/models/*.pkl
   ls backend/encoders/*.pkl
   ```

2. **Check file sizes** (must not be 0 bytes)

3. **Check FastAPI startup logs** - should show:
   ```
   ✓ Loaded revenue model from ...
   ✓ Loaded success model from ...
   ✓ Loaded encoders_direct from ...
   ✓ Loaded encoders_success from ...
   ```

4. **Check health endpoint**:
   ```bash
   curl http://localhost:8000/api/health
   ```
   Should return: `{"status": "ok", "models_loaded": true, ...}`

### "Ran out of input" error?

This means the pickle file is empty or corrupted:
- Delete the corrupted file
- Re-run the save cell or copy script
- Ensure the model variable exists before saving

### Permission errors?

Make sure you have write permissions to `backend/models/` and `backend/encoders/` directories.

## Next Steps

After saving models:

1. **Restart FastAPI**:
   ```bash
   cd D:\Fyp\FYP-EcoImpact\backend
   .\venv\Scripts\activate
   uvicorn app:app --reload --port 8000
   ```

2. **Verify health**:
   ```bash
   curl http://localhost:8000/api/health
   ```

3. **Test prediction**:
   ```bash
   curl -X POST http://localhost:8000/predict/all \
     -H "Content-Type: application/json" \
     -d '{"duration": 5, "policyType": "carbonTax", "carbonPrice": 50, "country": "United States"}'
   ```
