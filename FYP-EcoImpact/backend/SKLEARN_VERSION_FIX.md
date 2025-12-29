# sklearn Version Fix

## Problem

When trying to load models, you got this error:
```
ModuleNotFoundError: No module named '_loss'
```

**Root Cause:** The ML models were trained with `scikit-learn 1.6.1`, but the backend virtual environment was using `scikit-learn 1.3.2`. The newer models require components from sklearn 1.6.1 that don't exist in 1.3.2.

## Solution

Upgrade scikit-learn in the backend venv to match the training version:

```powershell
cd D:\Fyp\FYP-EcoImpact\backend
.\venv\Scripts\activate
pip install --upgrade scikit-learn==1.6.1
```

Or update `requirements.txt` and reinstall:

```powershell
# requirements.txt now has: scikit-learn==1.6.1
pip install -r requirements.txt
```

## Verification

After upgrading, verify models load:

```powershell
cd D:\Fyp\FYP-EcoImpact\backend
.\venv\Scripts\python.exe -c "from utils.simulator import PolicySimulator; sim = PolicySimulator(); print(f'Models loaded: {sim.revenue_model is not None and sim.success_model is not None}')"
```

Expected output:
```
[OK] Loaded revenue model from ...
[OK] Loaded success model from ...
[OK] Loaded encoders_direct from ...
[OK] Loaded encoders_success from ...
Models loaded: True
```

## Files Changed

- `backend/requirements.txt` - Updated from `scikit-learn==1.3.2` to `scikit-learn==1.6.1`
- `backend/utils/simulator.py` - Fixed Unicode encoding issues in print statements (changed emojis to [OK]/[WARN]/[ERROR] tags)

## Important Note

When training new models in the future, ensure the training environment uses the same sklearn version as the backend. This prevents version compatibility issues.

## Alternative Solution

If you prefer to keep sklearn 1.3.2 in the backend, you would need to:
1. Retrain all models using sklearn 1.3.2
2. Save the new models
3. Copy them to the backend

However, upgrading sklearn is the recommended approach since it's backwards compatible and simpler.


