# Temporary Workaround: Mock Data in Backend (For Testing Only)

If you want to test the frontend connection **without** saving ML models first, you can temporarily modify the backend to return mock data.

## ⚠️ WARNING: This is for testing only! Remove before production.

## Option: Modify backend/app.py

Replace the model check section (around line 126-136) with this temporary code:

```python
# TEMPORARY: Return mock data if models not loaded (FOR TESTING ONLY)
if sim.revenue_model is None or sim.success_model is None:
    # Return mock response for testing
    from datetime import datetime
    yearly_predictions = []
    for year_offset in range(1, policy_input.duration + 1):
        yearly_predictions.append({
            "year": (policy_input.year or 2024) + year_offset - 1,
            "revenue_million_usd": float(policy_input.carbon_price or policy_input.carbonPrice) * 50,
            "coverage": 45.0,
            "co2_reduction_percent": None,
            "gdp_impact": None
        })
    
    return {
        "success": True,
        "inputs": {
            "duration": policy_input.duration,
            "policy_type": normalized_policy_type,
            "carbon_price": float(policy_input.carbon_price or policy_input.carbonPrice),
            "country": policy_input.country,
            "year": policy_input.year or 2024
        },
        "success_probability": 0.85,
        "risk_level": "low",
        "status": "Low Risk (Mock Data)",
        "yearly_predictions": yearly_predictions,
        "overall_revenue": sum([p["revenue_million_usd"] for p in yearly_predictions]),
        "overall_co2_reduction": None
    }
```

**Remember to remove this temporary code and save your actual ML models before production!**



