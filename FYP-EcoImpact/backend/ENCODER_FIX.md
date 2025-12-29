# Label Encoder Fix

## Problem

Getting errors: 
- `y contains previously unseen labels: None`
- `y contains previously unseen labels: 'Carbon Tax'`

## Root Causes Found

1. **Type mismatch**: Encoder expects `'Carbon tax'` (lowercase 'tax') but code was passing `'Carbon Tax'` (uppercase 'T')
2. **None values**: Region and Income group were returning None because mappings weren't loaded from dataset
3. **Country name mismatch**: Some countries in user input don't match exact jurisdiction names in dataset

## Fixes Applied

### 1. Fixed Type value (simulator.py)
Changed:
```python
policy_type = 'Carbon Tax' if policy_data['policyType'] == 'carbonTax' else 'ETS'
```
To:
```python
policy_type = 'Carbon tax' if policy_data['policyType'] == 'carbonTax' else 'ETS'
```

**Reason**: Encoder classes are `['Carbon tax' 'ETS']` - must match exactly.

### 2. Load Region/Income Group from Dataset (country_mapper.py)
- Added `_load_country_metadata()` function that loads from `ecoimpact_complete_dataset.csv`
- Loads mappings from 'Jurisdiction' column (dataset uses Jurisdiction, not Country)
- Caches mappings for performance
- Added case-insensitive lookup as fallback

### 3. Better Error Handling (simulator.py)
- Added validation to check if values are None before encoding
- Added helpful error messages showing valid encoder classes if value doesn't match

## Current Status

- ✅ Type encoding fixed - "Carbon tax" matches encoder
- ✅ Region/Income group loading from dataset implemented
- ⚠️ Some countries may not be in dataset (e.g., Pakistan, United States)

## Testing

Test with countries that exist in dataset:
- Germany → Region: "Europe & Central Asia", Income: "High income"
- China → Region: "East Asia & Pacific", Income: "Upper middle income"

If a country is not in dataset, you'll get a clear error message now.

## Next Steps

If you need to support countries not in the dataset:
1. Add them to the dataset CSV, OR
2. Add manual mappings in `country_mapper.py` COUNTRY_MAPPINGS dictionary


