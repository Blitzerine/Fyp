# Fossil Fuel Dependency ML Model - Documentation

## Overview

The Fossil Fuel Dependency ML model learns historical trends in fossil fuel share (%) from real energy mix data. It **does NOT** learn policy impacts, but provides a data-driven baseline that can be adjusted by policy simulations.

## Model Architecture

### Target Variable
- **fossil_share_%**: `(coal + oil + gas) / (total energy) × 100`
  - Range: 0-100%
  - Computed from per-capita energy consumption data

### Features
- **year**: Year (1965-2024)
- **country**: Country name (label encoded)
- **region**: Region (label encoded)
- **income_group**: Income group (label encoded)

**Note**: We do NOT use carbon price or policy type as features (they don't exist in the historical dataset).

### Model Type
- **Primary**: GradientBoostingRegressor
  - n_estimators: 100
  - max_depth: 5
  - learning_rate: 0.1
- **Comparison**: LinearRegression (lower performance, kept for reference)

### Performance Metrics
- **Test R²**: 0.9550
- **Test MAE**: 2.31%
- **CV R²**: 0.9494 (± 0.0078)
- **CV MAE**: 2.43% (± 0.21%)

## Data Source

- **Dataset**: `per-capita-energy-stacked.csv`
- **Source**: Energy Institute - Statistical Review of World Energy (2025)
- **Coverage**: 91 countries, 1965-2024
- **Training samples**: 5,139 rows (after data cleaning)

## Yearly Delta Learning

The model computes historical yearly deltas:
- **delta_year** = fossil_share_(t) - fossil_share_(t-1)
- **Average delta per country**: Stored for projection
- **Average delta per region**: Used as fallback
- **Global average**: -0.224%/year (gradual decrease)

## Integration Approach (Hybrid)

### 1. ML Baseline (Historical Trend)
```python
baseline_fossil_share = predict_fossil_fuel_share(country, year)
yearly_delta = get_average_yearly_delta(country)
```

### 2. Policy Adjustment (Rule-based)
```python
# Higher carbon price → faster transition
if carbon_price >= 50:
    policy_factor = 1.5  # Accelerate transition
elif carbon_price >= 25:
    policy_factor = 1.2
elif carbon_price >= 10:
    policy_factor = 1.1

adjusted_delta = yearly_delta * policy_factor
```

### 3. Time Series Projection
```python
for year in range(duration):
    if year == 0:
        fossil_pct = baseline_fossil_share  # ML prediction
    else:
        fossil_pct = previous_fossil_pct + adjusted_delta  # Projected
```

**Key Point**: ML learns historical trends, policy simulation adjusts the projection rate. This separation is **defensible** and **transparent**.

## Validation & Safety

1. **Range Validation**: Fossil fuel % clamped to [0, 100]
2. **Missing Data Fallback**:
   - If country not in model → use regional average delta
   - If region not found → use global median delta
   - If ML model not loaded → use region-based defaults
3. **Warnings**: All fallbacks are logged for transparency

## API Response Format

```json
{
  "fossil_fuel_time_series": [
    {
      "year": 2024,
      "fossil_pct": 81.18,
      "is_ml_baseline": true
    },
    {
      "year": 2025,
      "fossil_pct": 80.68,
      "is_ml_baseline": false
    }
  ],
  "yearly_predictions": [
    {
      "year": 2024,
      "fossil_fuel_pct": 81.18
    }
  ]
}
```

## Training

```bash
cd backend
python scripts/train_fossil_fuel_model.py
```

**Output files**:
- `backend/models/fossil_fuel_model.pkl`
- `backend/encoders/fossil_fuel_encoders.pkl`
- `backend/models/fossil_fuel_deltas.pkl`

## Example: Pakistan

### Historical Data (from dataset)
- 2020: 86.06%
- 2021: 86.42%
- 2022: 83.80%
- 2023: 81.64%
- 2024: 81.18%

### ML Prediction (2024)
- Baseline: ~81.18% (matches historical data)
- Yearly delta: ~-0.5%/year (based on historical trend)

### Projection (2025-2027, carbon_price=12 USD)
- 2025: ~80.68% (baseline - 0.5%)
- 2026: ~80.18% (continued trend)
- 2027: ~79.68% (continued trend)

**Note**: With higher carbon prices, the transition accelerates (policy_factor > 1.0).

## Important Constraints

1. **Do NOT claim ML learns policy impact** - ML only learns historical trends
2. **Transparent separation** - ML baseline vs. policy adjustment
3. **Defensible methodology** - Uses real historical data, no fabrication
4. **FYP-ready** - Clear documentation of what is ML-learned vs. simulated

## Files Changed

1. **`backend/scripts/train_fossil_fuel_model.py`**: Training script
2. **`backend/utils/simulator.py`**: Added ML model loading and prediction methods
3. **`backend/app.py`**: Updated API to return fossil fuel time series
4. **`frontend/src/components/simulate/FossilFuelTimeSeriesChart.js`**: New chart component
5. **`frontend/src/pages/Simulate.js`**: Updated to use time series data

## Testing

```bash
# Train model
cd backend
python scripts/train_fossil_fuel_model.py

# Start backend
uvicorn app:app --reload --port 8000

# Test API
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "country": "Pakistan",
    "policy_type": "Carbon Tax",
    "carbon_price": 12,
    "duration": 3,
    "year": 2024
  }'
```

---

**Status**: ✅ **COMPLETE** - Model trained, integrated, and documented


