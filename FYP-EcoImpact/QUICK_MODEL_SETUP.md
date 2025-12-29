# Quick Guide: Save ML Models to Backend

## Problem
The FastAPI backend is looking for ML models but they're not in the expected location.

## Required Files

You need these 4 files in your backend:

1. `backend/models/revenue_model_gb.pkl` - Revenue prediction model
2. `backend/models/success_model_gb.pkl` - Success probability model  
3. `backend/encoders/encoders_direct.pkl` - Label encoders for revenue model
4. `backend/encoders/encoders_success.pkl` - Label encoders for success model

## Solution: Save Models from Jupyter Notebook

### Step 1: Open Your Model Training Notebook

Open: `FYP-EcoImpact/ai-model/ML Model/model.ipynb`

### Step 2: Add This Code at the End (After Training)

Add a new code cell at the end of your notebook and paste this:

```python
# ============================================
# SAVE MODELS AND ENCODERS TO BACKEND
# ============================================

import pickle
from pathlib import Path

# Define paths relative to your notebook location
# Adjust the path if your notebook is in a different location
backend_dir = Path('../../backend')  # Go up 2 levels: ai-model/ML Model/ -> FYP-EcoImpact/ -> backend/
models_dir = backend_dir / 'models'
encoders_dir = backend_dir / 'encoders'

# Create directories if they don't exist
models_dir.mkdir(parents=True, exist_ok=True)
encoders_dir.mkdir(parents=True, exist_ok=True)

# Save Revenue Model (replace 'gb_direct' with your actual model variable name)
revenue_model_path = models_dir / 'revenue_model_gb.pkl'
with open(revenue_model_path, 'wb') as f:
    pickle.dump(gb_direct, f)  # Replace 'gb_direct' with your revenue model variable
print(f"✓ Saved revenue model to {revenue_model_path}")

# Save Success Model (replace 'gb_success_final' with your actual model variable name)
success_model_path = models_dir / 'success_model_gb.pkl'
with open(success_model_path, 'wb') as f:
    pickle.dump(gb_success_final, f)  # Replace 'gb_success_final' with your success model variable
print(f"✓ Saved success model to {success_model_path}")

# Save Direct Encoders (replace 'encoders_direct' with your actual encoder variable name)
encoders_direct_path = encoders_dir / 'encoders_direct.pkl'
with open(encoders_direct_path, 'wb') as f:
    pickle.dump(encoders_direct, f)  # Replace with your encoder variable name
print(f"✓ Saved encoders_direct to {encoders_direct_path}")

# Save Success Encoders (replace 'encoders_success' with your actual encoder variable name)
encoders_success_path = encoders_dir / 'encoders_success.pkl'
with open(encoders_success_path, 'wb') as f:
    pickle.dump(encoders_success, f)  # Replace with your encoder variable name
print(f"✓ Saved encoders_success to {encoders_success_path}")

print("\n✅ All models and encoders saved successfully!")
```

### Step 3: Update Variable Names

**Important**: Replace these variable names with your actual variable names from your notebook:
- `gb_direct` → Your revenue model variable name
- `gb_success_final` → Your success model variable name
- `encoders_direct` → Your revenue model encoder variable name
- `encoders_success` → Your success model encoder variable name

### Step 4: Run the Cell

Execute the cell. You should see confirmation messages like:
```
✓ Saved revenue model to ../../backend/models/revenue_model_gb.pkl
✓ Saved success model to ../../backend/models/success_model_gb.pkl
✓ Saved encoders_direct to ../../backend/encoders/encoders_direct.pkl
✓ Saved encoders_success to ../../backend/encoders/encoders_success.pkl

✅ All models and encoders saved successfully!
```

### Step 5: Verify Files Exist

Check that the files were created:

```bash
cd FYP-EcoImpact/backend/models
dir  # Windows
# or
ls   # Mac/Linux

cd ../encoders
dir  # Windows
# or  
ls   # Mac/Linux
```

You should see 2 `.pkl` files in each directory.

### Step 6: Restart FastAPI Server

After saving the models, restart your FastAPI server:

```bash
cd FYP-EcoImpact/backend
uvicorn app:app --reload --port 8000
```

The models should now load successfully!

## Alternative: If Models Are Already Saved Elsewhere

If you already have the `.pkl` files saved somewhere else, you can copy them:

```bash
# Copy your existing model files to backend/models/
copy "path\to\your\revenue_model.pkl" "FYP-EcoImpact\backend\models\revenue_model_gb.pkl"
copy "path\to\your\success_model.pkl" "FYP-EcoImpact\backend\models\success_model_gb.pkl"

# Copy your existing encoder files to backend/encoders/
copy "path\to\your\encoders_direct.pkl" "FYP-EcoImpact\backend\encoders\encoders_direct.pkl"
copy "path\to\your\encoders_success.pkl" "FYP-EcoImpact\backend\encoders\encoders_success.pkl"
```

## Troubleshooting

**If the path doesn't work:**
- Check where your notebook is located relative to the backend folder
- Adjust the `backend_dir = Path('../../backend')` path accordingly
- You can use absolute path: `backend_dir = Path(r'D:\Fyp\FYP-EcoImpact\backend')`

**If you get "variable not found" error:**
- Make sure you've trained the models in the notebook before running the save code
- Check the exact variable names in your notebook
- Replace the variable names in the save code with your actual variable names



