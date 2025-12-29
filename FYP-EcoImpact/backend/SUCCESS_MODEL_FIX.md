# Success Model Fix - Risk Level Logic

## Problem

The success model was incorrectly determining risk levels. When the model predicted 90%+ probability, it was showing "Low Risk" which seemed incorrect.

## Root Cause

The success model classes are: `['Abolished', 'Implemented']`
- **Class 0 = Abolished** (bad outcome - policy fails)
- **Class 1 = Implemented** (good outcome - policy succeeds)

The backend code was using `predict_proba()[0][1]` (probability of success/implementation) but the risk assessment logic should be based on the **probability of abolishment** (class 0).

## The Fix

Changed `predict_success()` in `backend/utils/simulator.py` to:

1. **Extract both probabilities**:
   ```python
   proba = self.success_model.predict_proba(encoded_features)[0]
   abolished_prob = proba[0]  # Probability of abolishment (BAD)
   success_prob = proba[1]     # Probability of success (GOOD)
   ```

2. **Use abolishment probability for risk assessment** (as per notebook logic):
   ```python
   if abolished_prob < 0.35:
       risk = 'low'       # Low abolishment = Low Risk (policy likely to succeed)
       status = 'Low Risk'
   elif abolished_prob < 0.65:
       risk = 'medium'    # Medium abolishment = Medium Risk
       status = 'Medium Risk'
   else:
       risk = 'high'      # High abolishment = High Risk (policy likely to fail)
       status = 'High Risk'
   ```

3. **Return success probability for display**:
   - The `probability` field in the response is `success_prob` (what user sees)
   - 90% means 90% chance of success/implementation (good outcome)
   - Risk level is correctly determined based on abolishment probability

## Logic Alignment with Notebook

The notebook (`model.ipynb`) uses the same logic:
- Line 7983: `abolished_prob = pred_proba[0]` (uses class 0 - Abolished)
- Lines 7985-7990: Risk assessment based on abolishment probability:
  - `< 0.35` → Low Risk
  - `< 0.65` → At Risk / Medium Risk
  - `>= 0.65` → High Risk

## Example

**Before Fix:**
- Model predicts: 90% success probability (10% abolishment)
- Risk Level: Low Risk ✓ (but was calculated incorrectly)

**After Fix:**
- Model predicts: 90% success probability, 10% abolishment probability
- Risk Level: Low Risk ✓ (correctly calculated: 10% abolishment < 0.35 threshold)

**Another Example:**
- Model predicts: 30% success probability (70% abolishment)
- Risk Level: High Risk ✓ (correctly calculated: 70% abolishment >= 0.65 threshold)

## Files Changed

- `backend/utils/simulator.py`: Fixed `predict_success()` method

## Verification

The risk levels now correctly reflect the policy's likelihood of failure (abolishment):
- **Low Risk**: Less than 35% chance of abolishment (policy likely to succeed)
- **Medium Risk**: 35-65% chance of abolishment (uncertain outcome)
- **High Risk**: More than 65% chance of abolishment (policy likely to fail)


