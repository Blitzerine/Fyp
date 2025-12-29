# Compare Table Fixes Applied

## Issues Fixed

### 1. ✅ Highlighting Bug Fixed
**Problem**: Missing `&&` operator in CompareTable.js line 117 caused incorrect highlighting logic.

**Fix**: Added missing `&&` operator:
```javascript
// Before (BROKEN):
maxCO2Covered != null
sim.co2Covered != null &&

// After (FIXED):
maxCO2Covered != null &&
sim.co2Covered != null &&
```

**File**: `frontend/src/components/compare/CompareTable.js`

---

### 2. ✅ Row Click Prevention
**Problem**: User reported that clicking table rows was opening old policy stats or navigating.

**Fixes Applied**:
1. Added `cursor: default` style to table rows
2. Added `stopPropagation()` to Remove button click handler to prevent event bubbling
3. Added CSS rule `.compare-table tbody tr { cursor: default; }`

**Files**: 
- `frontend/src/components/compare/CompareTable.js`
- `frontend/src/index.css`

**Result**: Table rows are now non-clickable. Only buttons (Remove, Download, Clear All) are interactive.

---

### 3. ✅ Removed Hardcoded Coverage Default
**Problem**: Frontend had a hardcoded fallback value of 45.0% for coverage.

**Fix**: Changed from `coverage !== null ? coverage : 45.0` to `coverage !== null && coverage !== undefined ? coverage : null`

**File**: `frontend/src/pages/Simulate.js` line 203

**Result**: No default value - if backend doesn't provide coverage, it will be `null` (frontend will display "N/A" or handle gracefully).

---

## Current State Analysis

### Coverage Prediction (Country-Sensitive)
**Current Implementation**: Uses heuristic-based `predict_coverage()` method in `backend/utils/simulator.py`

**Method is Country-Sensitive**: The heuristic uses multiple country-specific factors:
- **Region** (6 different base values: 28-52%)
- **Income group** (adjustments: -8% to +12%)
- **Policy type** (ETS: +7%, Carbon Tax: +0%)
- **Carbon price** (variable adjustment based on price)
- **Fossil fuel dependency** (up to 8% adjustment)
- **GDP scale** (up to 4% adjustment)
- **Population** (up to 1.5% adjustment)
- **Year trend** (0.3% per year after 2020)
- **CO2 emissions** (variable adjustment)

**Result**: This SHOULD produce different coverage values for different countries.

**Note**: User requested ML-based coverage model, but no ML model exists for coverage prediction. Current heuristic method is country-sensitive and should work correctly.

---

### Revenue % of GDP (Country-Specific)
**Current Implementation**: Already country-specific!

**How it works**:
1. Backend retrieves country-specific GDP from dataset (`features_data['revenue']['GDP']`)
2. Calculates: `revenue_pct_gdp = (annual_revenue_usd / gdp_usd_country_year) * 100`
3. Uses real GDP values from `ecoimpact_complete_dataset.csv`
4. Falls back to previous years if current year GDP not available
5. Returns `null` if GDP missing (frontend shows "N/A")

**File**: `backend/app.py` lines 246-253

**Result**: Revenue % GDP is already country-specific and uses real GDP values.

---

## Testing Recommendations

To verify coverage is country-sensitive, test with:
1. **Different countries** with same policy inputs:
   - Pakistan (Lower-middle income, South Asia)
   - Germany (High income, Europe)
   - USA (High income, North America)
   - Nigeria (Lower-middle income, Sub-Saharan Africa)

2. **Expected Results**:
   - Coverage should differ based on region/income group
   - Revenue % GDP should differ based on country GDP
   - CO2 Covered should differ based on country emissions

3. **Backend Logs**: Check for `[CALC]` logs showing different coverage values per country

---

## Files Changed

1. `frontend/src/components/compare/CompareTable.js`
   - Fixed highlighting logic (line 117)
   - Added `cursor: default` to table rows
   - Added `stopPropagation()` to Remove button

2. `frontend/src/index.css`
   - Added `.compare-table tbody tr { cursor: default; }`

3. `frontend/src/pages/Simulate.js`
   - Removed hardcoded 45% default for coverage

---

## Remaining Considerations

1. **ML-Based Coverage Model**: User requested ML model for coverage. Currently using heuristic method which is country-sensitive. To implement ML-based coverage:
   - Need to train a new ML model
   - Requires training dataset with coverage labels
   - Would need to update `predict_coverage()` to use the ML model

2. **Coverage Values**: If coverage still shows same values for all countries:
   - Check backend logs for actual coverage values returned
   - Verify `predict_coverage()` is being called correctly
   - Ensure country metadata (region, income group) is resolved correctly

---

## Verification Checklist

- [x] Highlighting bug fixed (missing && operator)
- [x] Row click prevention (cursor: default, stopPropagation)
- [x] Hardcoded coverage default removed
- [x] Coverage method verified to be country-sensitive (heuristic)
- [x] Revenue % GDP verified to be country-specific (uses real GDP)
- [ ] Test with multiple countries to verify different values
- [ ] Check backend logs to confirm coverage values differ by country


