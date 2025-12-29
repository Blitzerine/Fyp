"""
Train ML Model for Fossil Fuel Dependency Prediction

This script trains a regression model to predict fossil fuel dependency percentage
based on historical energy mix data from per-capita-energy-stacked.csv.

Key Features:
- Uses only defensible features: year, country (encoded), region, income group
- Does NOT use policy or carbon price (historical trend only)
- Computes yearly delta trends for projection
"""

import pandas as pd
import numpy as np
from pathlib import Path
import pickle
import sys
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
import warnings
warnings.filterwarnings('ignore')

# Add parent directory to path to import utils
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.data_loader import DATA_DIR
from utils.country_mapper import get_country_region, get_country_income_group

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'
ENERGY_DATA_PATH = DATA_DIR / 'energy_mix_dataset' / 'per-capita-energy-stacked.csv'
DATASET_DIR = BASE_DIR.parent / 'ai-model' / 'dataset' / 'processed'
MODEL_SAVE_DIR = BASE_DIR / 'models'
ENCODER_SAVE_DIR = BASE_DIR / 'encoders'

MODEL_SAVE_DIR.mkdir(parents=True, exist_ok=True)
ENCODER_SAVE_DIR.mkdir(parents=True, exist_ok=True)


def find_dataset_path():
    """Find the main dataset CSV file"""
    paths = [
        DATASET_DIR / 'ecoimpact_complete_dataset.csv',
        BASE_DIR.parent / 'ai-model' / 'dataset' / 'processed' / 'ecoimpact_complete_dataset.csv',
    ]
    for path in paths:
        if path.exists():
            return path
    raise FileNotFoundError("Could not find ecoimpact_complete_dataset.csv")


def load_country_metadata():
    """Load country metadata (region, income group) from main dataset"""
    dataset_path = find_dataset_path()
    df = pd.read_csv(dataset_path)
    
    # Get unique country metadata (use first occurrence for each country)
    metadata = df.groupby('Jurisdiction').agg({
        'Region': 'first',
        'Income group': 'first'
    }).reset_index()
    
    # Create mapping dictionaries
    region_map = dict(zip(metadata['Jurisdiction'], metadata['Region']))
    income_map = dict(zip(metadata['Jurisdiction'], metadata['Income group']))
    
    return region_map, income_map


def compute_fossil_share(df):
    """
    Compute fossil fuel share percentage from energy mix data
    
    Args:
        df: DataFrame with energy mix columns
        
    Returns:
        DataFrame with added fossil_share_% column
    """
    # Compute fossil per capita (coal + oil + gas)
    fossil_cols = ['Coal per capita (kWh)', 'Oil per capita (kWh)', 'Gas per capita (kWh)']
    df['Fossil_per_capita'] = df[fossil_cols].sum(axis=1)
    
    # Compute total energy per capita
    renewable_cols = [
        'Nuclear per capita (kWh - equivalent)',
        'Hydro per capita (kWh - equivalent)',
        'Wind per capita (kWh - equivalent)',
        'Solar per capita (kWh - equivalent)',
        'Other renewables per capita (kWh - equivalent)'
    ]
    df['Renewable_per_capita'] = df[renewable_cols].sum(axis=1)
    df['Total_energy_per_capita'] = df['Fossil_per_capita'] + df['Renewable_per_capita']
    
    # Compute fossil share percentage
    df['fossil_share_%'] = (df['Fossil_per_capita'] / df['Total_energy_per_capita']) * 100
    
    # Replace inf and handle division by zero
    df['fossil_share_%'] = df['fossil_share_%'].replace([np.inf, -np.inf], np.nan)
    
    return df


def prepare_training_data():
    """Load and prepare training data"""
    print("[1/6] Loading energy mix data...")
    energy_df = pd.read_csv(ENERGY_DATA_PATH)
    
    print(f"    Loaded {len(energy_df)} rows from energy mix dataset")
    print(f"    Columns: {list(energy_df.columns)}")
    
    print("\n[2/6] Computing fossil fuel share percentage...")
    energy_df = compute_fossil_share(energy_df)
    
    # Drop rows where total energy is zero or missing
    initial_rows = len(energy_df)
    energy_df = energy_df.dropna(subset=['fossil_share_%', 'Total_energy_per_capita'])
    energy_df = energy_df[energy_df['Total_energy_per_capita'] > 0]
    final_rows = len(energy_df)
    
    print(f"    Dropped {initial_rows - final_rows} rows with invalid data")
    print(f"    Remaining: {final_rows} rows")
    
    # Validate fossil share is between 0 and 100
    invalid = energy_df[(energy_df['fossil_share_%'] < 0) | (energy_df['fossil_share_%'] > 100)]
    if len(invalid) > 0:
        print(f"    WARNING: {len(invalid)} rows with fossil_share_% outside [0, 100], clipping...")
        energy_df = energy_df[(energy_df['fossil_share_%'] >= 0) & (energy_df['fossil_share_%'] <= 100)]
    
    print("\n[3/6] Loading country metadata...")
    region_map, income_map = load_country_metadata()
    print(f"    Loaded metadata for {len(region_map)} countries")
    
    # Map region and income group using Entity column (country name)
    # Note: Entity column in energy data might need standardization
    energy_df['Region'] = energy_df['Entity'].map(region_map)
    energy_df['Income_group'] = energy_df['Entity'].map(income_map)
    
    # Use fallback mappings for countries not in dataset
    missing_metadata = energy_df['Region'].isna() | energy_df['Income_group'].isna()
    if missing_metadata.sum() > 0:
        print(f"    WARNING: {missing_metadata.sum()} rows missing metadata, using fallback mappings...")
        for idx, row in energy_df[missing_metadata].iterrows():
            entity = row['Entity']
            energy_df.at[idx, 'Region'] = get_country_region(entity)
            energy_df.at[idx, 'Income_group'] = get_country_income_group(entity)
    
    # Drop rows where we still don't have metadata (should be very few)
    final_missing = energy_df['Region'].isna() | energy_df['Income_group'].isna()
    if final_missing.sum() > 0:
        print(f"    Dropping {final_missing.sum()} rows still missing metadata")
        energy_df = energy_df[~final_missing]
    
    print(f"\n    Final dataset size: {len(energy_df)} rows")
    print(f"    Countries: {energy_df['Entity'].nunique()}")
    print(f"    Year range: {energy_df['Year'].min()} - {energy_df['Year'].max()}")
    
    return energy_df


def train_model(energy_df):
    """Train ML model to predict fossil fuel share"""
    print("\n[4/6] Preparing features and target...")
    
    # Prepare features: year, country (encoded), region (encoded), income_group (encoded)
    features_df = pd.DataFrame({
        'Year': energy_df['Year'],
        'Country': energy_df['Entity'],
        'Region': energy_df['Region'],
        'Income_group': energy_df['Income_group']
    })
    
    target = energy_df['fossil_share_%'].values
    
    # Encode categorical features
    country_encoder = LabelEncoder()
    region_encoder = LabelEncoder()
    income_encoder = LabelEncoder()
    
    features_df['Country_encoded'] = country_encoder.fit_transform(features_df['Country'])
    features_df['Region_encoded'] = region_encoder.fit_transform(features_df['Region'])
    features_df['Income_group_encoded'] = income_encoder.fit_transform(features_df['Income_group'])
    
    # Final feature matrix: year, country_encoded, region_encoded, income_group_encoded
    X = features_df[['Year', 'Country_encoded', 'Region_encoded', 'Income_group_encoded']].values
    y = target
    
    print(f"    Feature shape: {X.shape}")
    print(f"    Target range: {y.min():.2f}% - {y.max():.2f}%")
    print(f"    Target mean: {y.mean():.2f}%")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=None
    )
    
    print(f"\n    Training set: {len(X_train)} samples")
    print(f"    Test set: {len(X_test)} samples")
    
    # Train GradientBoostingRegressor (better for non-linear relationships)
    print("\n[5/6] Training GradientBoostingRegressor...")
    gb_model = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        verbose=0
    )
    gb_model.fit(X_train, y_train)
    
    # Evaluate on test set
    y_pred_test = gb_model.predict(X_test)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    test_r2 = r2_score(y_test, y_pred_test)
    
    print(f"    Test Set Performance:")
    print(f"      MAE: {test_mae:.2f}%")
    print(f"      R²: {test_r2:.4f}")
    
    # Cross-validation
    print("\n    Performing 5-fold cross-validation...")
    cv_scores_mae = -cross_val_score(gb_model, X_train, y_train, cv=5, scoring='neg_mean_absolute_error')
    cv_scores_r2 = cross_val_score(gb_model, X_train, y_train, cv=5, scoring='r2')
    
    print(f"    CV MAE: {cv_scores_mae.mean():.2f}% (+/- {cv_scores_mae.std() * 2:.2f}%)")
    print(f"    CV R²: {cv_scores_r2.mean():.4f} (+/- {cv_scores_r2.std() * 2:.4f})")
    
    # Also train a simple LinearRegression for comparison
    print("\n    Training LinearRegression for comparison...")
    lr_model = LinearRegression()
    lr_model.fit(X_train, y_train)
    
    lr_test_mae = mean_absolute_error(y_test, lr_model.predict(X_test))
    lr_test_r2 = r2_score(y_test, lr_model.predict(X_test))
    
    print(f"    LinearRegression Test Performance:")
    print(f"      MAE: {lr_test_mae:.2f}%")
    print(f"      R²: {lr_test_r2:.4f}")
    
    # Use GradientBoostingRegressor (better performance)
    model = gb_model
    
    return model, country_encoder, region_encoder, income_encoder, features_df, X, y


def compute_yearly_deltas(energy_df):
    """
    Compute yearly delta (change) in fossil fuel share per country
    This represents historical transition trends
    """
    print("\n[6/6] Computing yearly deltas...")
    
    # Sort by country and year
    energy_df_sorted = energy_df.sort_values(['Entity', 'Year'])
    
    # Compute delta for each country
    energy_df_sorted['fossil_share_prev'] = energy_df_sorted.groupby('Entity')['fossil_share_%'].shift(1)
    energy_df_sorted['yearly_delta'] = energy_df_sorted['fossil_share_%'] - energy_df_sorted['fossil_share_prev']
    
    # Compute average yearly delta per country (excluding first year where delta is NaN)
    avg_deltas = energy_df_sorted.groupby('Entity')['yearly_delta'].mean().to_dict()
    
    # Compute average yearly delta per region
    region_avg_deltas = energy_df_sorted.groupby('Region')['yearly_delta'].mean().to_dict()
    
    print(f"    Computed deltas for {len(avg_deltas)} countries")
    print(f"    Average country delta range: {min(avg_deltas.values()):.3f}% to {max(avg_deltas.values()):.3f}%")
    print(f"    Global average delta: {energy_df_sorted['yearly_delta'].mean():.3f}%/year")
    
    return avg_deltas, region_avg_deltas, energy_df_sorted[['Entity', 'Year', 'fossil_share_%', 'yearly_delta']]


def save_model_and_encoders(model, country_encoder, region_encoder, income_encoder, avg_deltas, region_avg_deltas):
    """Save trained model and encoders"""
    print("\n[Saving] Saving model and encoders...")
    
    # Save model
    model_path = MODEL_SAVE_DIR / 'fossil_fuel_model.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"    Saved model to: {model_path}")
    
    # Save encoders (without deltas - they go in separate file)
    encoders = {
        'country_encoder': country_encoder,
        'region_encoder': region_encoder,
        'income_encoder': income_encoder
    }
    
    encoder_path = ENCODER_SAVE_DIR / 'fossil_fuel_encoders.pkl'
    with open(encoder_path, 'wb') as f:
        pickle.dump(encoders, f)
    print(f"    Saved encoders to: {encoder_path}")
    
    # Save deltas separately
    deltas = {
        'country_deltas': avg_deltas,
        'region_deltas': region_avg_deltas
    }
    
    deltas_path = MODEL_SAVE_DIR / 'fossil_fuel_deltas.pkl'
    with open(deltas_path, 'wb') as f:
        pickle.dump(deltas, f)
    print(f"    Saved deltas to: {deltas_path}")
    
    return model_path, encoder_path, deltas_path


def main():
    """Main training pipeline"""
    print("=" * 70)
    print("Fossil Fuel Dependency ML Model Training")
    print("=" * 70)
    
    try:
        # Prepare data
        energy_df = prepare_training_data()
        
        # Train model
        model, country_encoder, region_encoder, income_encoder, features_df, X, y = train_model(energy_df)
        
        # Compute yearly deltas
        avg_deltas, region_avg_deltas, delta_df = compute_yearly_deltas(energy_df)
        
        # Save model and encoders
        model_path, encoder_path, deltas_path = save_model_and_encoders(
            model, country_encoder, region_encoder, income_encoder, 
            avg_deltas, region_avg_deltas
        )
        
        print("\n" + "=" * 70)
        print("Training Complete!")
        print("=" * 70)
        print(f"\nModel saved to: {model_path}")
        print(f"Encoders saved to: {encoder_path}")
        print("\nNext steps:")
        print("1. Test the model using the simulator")
        print("2. Update backend to use this model for fossil fuel predictions")
        print("3. Update frontend to display yearly fossil fuel dependency trends")
        
        # Example prediction for Pakistan
        print("\n" + "=" * 70)
        print("Example: Pakistan Historical Data")
        print("=" * 70)
        pak_data = energy_df[energy_df['Entity'].str.contains('Pakistan', case=False, na=False)]
        if not pak_data.empty:
            pak_sorted = pak_data.sort_values('Year')
            print(f"\nHistorical fossil fuel dependency for Pakistan:")
            for _, row in pak_sorted.tail(10).iterrows():
                print(f"  {int(row['Year'])}: {row['fossil_share_%']:.2f}%")
        else:
            print("  Pakistan not found in dataset")
        
    except Exception as e:
        print(f"\n[ERROR] Training failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
