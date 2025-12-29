# Copy This Code Into Your Jupyter Notebook

Since you've already run all cells, **add this as a NEW cell** at the end of your notebook and run it:

```python
# ============================================
# SAVE MODELS AND ENCODERS TO BACKEND
# ============================================

import pickle
from pathlib import Path

# Path to backend directory
backend_dir = Path('../../backend')  # Adjust if your notebook path is different
models_dir = backend_dir / 'models'
encoders_dir = backend_dir / 'encoders'

# Create directories if they don't exist
models_dir.mkdir(parents=True, exist_ok=True)
encoders_dir.mkdir(parents=True, exist_ok=True)

print("Saving models and encoders...")
print(f"Models directory: {models_dir}")
print(f"Encoders directory: {encoders_dir}\n")

# IMPORTANT: Replace these variable names with YOUR actual variable names from the notebook!
# Common names are: gb_direct, gb_success_final, encoders_direct, encoders_success
# Check your notebook to find the exact variable names

try:
    # Save Revenue Model
    # Replace 'gb_direct' with your actual revenue model variable name
    revenue_model_path = models_dir / 'revenue_model_gb.pkl'
    with open(revenue_model_path, 'wb') as f:
        pickle.dump(gb_direct, f)  # <-- CHANGE THIS VARIABLE NAME
    print(f"✓ Saved revenue model to {revenue_model_path}")
except NameError as e:
    print(f"✗ Revenue model variable not found: {e}")
    print("   Please replace 'gb_direct' with your actual revenue model variable name")

try:
    # Save Success Model
    # Replace 'gb_success_final' with your actual success model variable name
    success_model_path = models_dir / 'success_model_gb.pkl'
    with open(success_model_path, 'wb') as f:
        pickle.dump(gb_success_final, f)  # <-- CHANGE THIS VARIABLE NAME
    print(f"✓ Saved success model to {success_model_path}")
except NameError as e:
    print(f"✗ Success model variable not found: {e}")
    print("   Please replace 'gb_success_final' with your actual success model variable name")

try:
    # Save Direct Encoders
    # Replace 'encoders_direct' with your actual encoder variable name
    encoders_direct_path = encoders_dir / 'encoders_direct.pkl'
    with open(encoders_direct_path, 'wb') as f:
        pickle.dump(encoders_direct, f)  # <-- CHANGE THIS VARIABLE NAME
    print(f"✓ Saved encoders_direct to {encoders_direct_path}")
except NameError as e:
    print(f"✗ encoders_direct variable not found: {e}")
    print("   Please replace 'encoders_direct' with your actual encoder variable name")

try:
    # Save Success Encoders
    # Replace 'encoders_success' with your actual encoder variable name
    encoders_success_path = encoders_dir / 'encoders_success.pkl'
    with open(encoders_success_path, 'wb') as f:
        pickle.dump(encoders_success, f)  # <-- CHANGE THIS VARIABLE NAME
    print(f"✓ Saved encoders_success to {encoders_success_path}")
except NameError as e:
    print(f"✗ encoders_success variable not found: {e}")
    print("   Please replace 'encoders_success' with your actual encoder variable name")

print("\n" + "="*60)
print("✅ Done! Check the messages above for any errors.")
print("="*60)
```

## Steps:

1. **Open your notebook**: `ai-model/ML Model/model.ipynb`

2. **Scroll to the end** (after all your training cells)

3. **Create a new cell** (click "+ Code" button)

4. **Copy and paste the code above**

5. **IMPORTANT**: Before running, find your actual variable names:
   - Look for where you trained your revenue model (e.g., `gb_direct`, `revenue_model`, etc.)
   - Look for where you trained your success model (e.g., `gb_success_final`, `success_model`, etc.)
   - Look for where you created encoders (e.g., `encoders_direct`, `encoders_success`, etc.)

6. **Replace the variable names** in the code with your actual variable names

7. **Run the cell**

8. **Restart FastAPI server**:
   ```bash
   cd FYP-EcoImpact/backend
   uvicorn app:app --reload --port 8000
   ```

## If You Get "NameError"

If you get a `NameError` saying a variable doesn't exist:
- Check your notebook to find the correct variable name
- Replace it in the code above
- Run the cell again



