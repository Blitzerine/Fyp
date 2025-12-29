# Revenue & Success Model Usage

## 📊 Revenue Model (`revenue_model_gb.pkl`)

### Location
- **File**: `backend/models/revenue_model_gb.pkl`
- **Encoder**: `backend/encoders/encoders_direct.pkl`

### Where It's Loaded
- **File**: `backend/utils/simulator.py`
- **Method**: `_load_models()` (lines 69-95)
- **Attribute**: `self.revenue_model`

### Where It's Used
1. **Prediction Method**:
   - **File**: `backend/utils/simulator.py`
   - **Method**: `predict_revenue()` (lines 862-878)
   - **What it does**: 
     - Prepares features using `prepare_features()['revenue']`
     - Encodes features using `encode_features(encoder_type='direct')`
     - Calls `revenue_model.predict()` to get annual revenue in million USD

2. **API Endpoint**:
   - **File**: `backend/app.py`
   - **Endpoint**: `POST /api/simulate` (line 206)
   - **Usage**: Called for each year in the simulation duration
   ```python
   revenue = sim.predict_revenue(year_policy_data)
   ```

### Output
- **Type**: `float`
- **Unit**: Million USD per year
- **Display**: Shown as "Annual Revenue" in frontend SummaryCards (labeled "ML-based")

---

## 🎯 Success Model (`success_model_gb.pkl`)

### Location
- **File**: `backend/models/success_model_gb.pkl`
- **Encoder**: `backend/encoders/encoders_success.pkl`

### Where It's Loaded
- **File**: `backend/utils/simulator.py`
- **Method**: `_load_models()` (lines 96-125)
- **Attribute**: `self.success_model`

### Where It's Used
1. **Prediction Method**:
   - **File**: `backend/utils/simulator.py`
   - **Method**: `predict_success()` (lines 880-914)
   - **What it does**: 
     - Prepares features using `prepare_features()['success']`
     - Encodes features using `encode_features(encoder_type='success')`
     - Calls `success_model.predict_proba()` to get success probability
     - Determines risk level based on probability:
       - `probability < 0.35` → High Risk
       - `0.35 ≤ probability < 0.65` → Medium Risk
       - `probability ≥ 0.65` → Low Risk

2. **API Endpoint**:
   - **File**: `backend/app.py`
   - **Endpoint**: `POST /api/simulate` (lines 210, 216)
   - **Usage**: Called for each year in the simulation duration
   ```python
   success_result = sim.predict_success(year_policy_data)
   success_prob = success_result["probability"]
   risk_level = success_result["risk"]
   status = success_result["status"]
   ```

### Output
- **Type**: `dict` with keys:
  - `probability`: float (0.0 to 1.0)
  - `risk`: str ('low', 'medium', 'high')
  - `status`: str ('Low Risk', 'Medium Risk', 'High Risk')
- **Display**: Shown as "Policy Success" card in frontend SummaryCards (labeled "ML-based")

---

## 🔄 Complete Flow

```
User submits simulation request
    ↓
POST /api/simulate (app.py)
    ↓
For each year in duration:
    ├─→ sim.predict_revenue() → revenue_model.predict()
    │   └─→ Returns: Annual revenue (million USD)
    │
    ├─→ sim.predict_success() → success_model.predict_proba()
    │   └─→ Returns: {probability, risk, status}
    │
    ├─→ sim.predict_coverage() → Heuristic calculation (NOT ML)
    │
    └─→ Calculations:
        ├─→ CO₂ Covered = (coverage % / 100) × emissions
        └─→ Revenue % GDP = (revenue / GDP) × 100
    ↓
Response sent to frontend
    ↓
Frontend displays:
    ├─→ Annual Revenue (ML-based) ← Revenue Model
    ├─→ Policy Success (ML-based) ← Success Model
    ├─→ Emission Coverage (Calculated)
    ├─→ CO₂ Covered (Calculated)
    └─→ Revenue as % of GDP (Calculated)
```

---

## ✅ Summary

- **Revenue Model**: Predicts annual revenue (million USD) → Used in API endpoint for each year
- **Success Model**: Predicts policy success probability and risk level → Used in API endpoint for each year
- Both models are loaded at FastAPI startup via `PolicySimulator.__init__()`
- Both models require their respective encoders to encode categorical features
- Both outputs are labeled as "ML-based" in the frontend SummaryCards component

