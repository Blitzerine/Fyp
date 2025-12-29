# ML Models Setup Instructions

## Current Status

The backend structure is set up, but **models and encoders need to be created** from your Jupyter notebooks.

## Required Files

You need to create these files by running your model training notebooks:

### Models (`.pkl` files)
- `backend/models/revenue_model_gb.pkl` - Revenue prediction model (GradientBoostingRegressor)
- `backend/models/success_model_gb.pkl` - Success probability model (GradientBoostingClassifier)

### Encoders (`.pkl` files)
- `backend/encoders/encoders_direct.pkl` - Label encoders for revenue model features
- `backend/encoders/encoders_success.pkl` - Label encoders for success model features

## How to Create Model Files

1. Open your Jupyter notebook: `ai-model/ML Model/model.ipynb`

2. After training your models, add code to save them:

```python
# Save revenue model
import pickle
with open('../../../backend/models/revenue_model_gb.pkl', 'wb') as f:
    pickle.dump(gb_direct, f)

# Save success model
with open('../../../backend/models/success_model_gb.pkl', 'wb') as f:
    pickle.dump(gb_success_final, f)

# Save encoders_direct
with open('../../../backend/encoders/encoders_direct.pkl', 'wb') as f:
    pickle.dump(encoders_direct, f)

# Save encoders_success
with open('../../../backend/encoders/encoders_success.pkl', 'wb') as f:
    pickle.dump(encoders_success, f)
```

3. Run the cells to save the files

## Folder Structure

```
backend/
├── models/              # ML model .pkl files (TO BE CREATED)
│   ├── revenue_model_gb.pkl
│   └── success_model_gb.pkl
├── encoders/            # Label encoder .pkl files (TO BE CREATED)
│   ├── encoders_direct.pkl
│   └── encoders_success.pkl
├── data/                # External lookup CSV files (COPIED)
│   ├── annual_co2_per_country/
│   ├── gdp_data/
│   ├── population_dataset/
│   └── energy_mix_dataset/
└── utils/               # Utility modules (CREATED)
    ├── country_mapper.py
    ├── data_loader.py
    └── simulator.py
```

## Data Files

The data files have been copied from `ai-model/dataset/` to `backend/data/`. You may need to adjust the column names in `utils/data_loader.py` to match your actual CSV structure.

## Next Steps

1. Train and save your models using the notebook
2. Update `utils/country_mapper.py` with your region and income group mappings
3. Adjust `utils/data_loader.py` column names to match your CSV files
4. Create a Python Flask/FastAPI backend to use these utilities
5. Integrate with the Node.js backend or replace it




