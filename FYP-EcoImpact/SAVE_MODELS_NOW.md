# Quick Guide: Save Your ML Models NOW

## Step 1: Open Your Jupyter Notebook
Open: `FYP-EcoImpact/ai-model/ML Model/model.ipynb`

## Step 2: Add This Code at the End

Create a new code cell and paste this (replace variable names with your actual model variable names):

```python
import pickle
from pathlib import Path

# Path to backend
backend_dir = Path('../../backend')
models_dir = backend_dir / 'models'
encoders_dir = backend_dir / 'encoders'

# Create directories
models_dir.mkdir(parents=True, exist_ok=True)
encoders_dir.mkdir(parents=True, exist_ok=True)

# IMPORTANT: Replace these variable names with YOUR actual variable names!
# Save Revenue Model
with open(models_dir / 'revenue_model_gb.pkl', 'wb') as f:
    pickle.dump(gb_direct, f)  # Replace 'gb_direct' with your revenue model variable
print("✓ Saved revenue_model_gb.pkl")

# Save Success Model
with open(models_dir / 'success_model_gb.pkl', 'wb') as f:
    pickle.dump(gb_success_final, f)  # Replace 'gb_success_final' with your success model variable
print("✓ Saved success_model_gb.pkl")

# Save Encoders
with open(encoders_dir / 'encoders_direct.pkl', 'wb') as f:
    pickle.dump(encoders_direct, f)  # Replace with your encoder variable name
print("✓ Saved encoders_direct.pkl")

with open(encoders_dir / 'encoders_success.pkl', 'wb') as f:
    pickle.dump(encoders_success, f)  # Replace with your encoder variable name
print("✓ Saved encoders_success.pkl")

print("\n✅ All models saved! Restart FastAPI server.")
```

## Step 3: Run the Cell

Execute the cell. You should see confirmation messages.

## Step 4: Restart FastAPI

```bash
cd FYP-EcoImpact/backend
uvicorn app:app --reload --port 8000
```

The error should disappear!



