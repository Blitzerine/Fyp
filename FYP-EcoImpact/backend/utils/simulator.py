"""
Simulator Utility
Main simulation logic that uses ML models to predict policy outcomes
"""

import pickle
import numpy as np
import pandas as pd
from pathlib import Path
import sys

# Handle relative imports
try:
    from .data_loader import (
        get_country_gdp, 
        get_country_population, 
        get_fossil_fuel_dependency,
        get_country_co2
    )
    from .country_mapper import (
        standardize_country_name,
        get_country_region,
        get_country_income_group
    )
except ImportError:
    # For direct execution
    sys.path.append(str(Path(__file__).parent.parent))
    from utils.data_loader import (
        get_country_gdp, 
        get_country_population, 
        get_fossil_fuel_dependency,
        get_country_co2
    )
    from utils.country_mapper import (
        standardize_country_name,
        get_country_region,
        get_country_income_group
    )

# Get the base directory (backend folder)
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / 'models'
ENCODERS_DIR = BASE_DIR / 'encoders'

# Fallback paths if files not in backend directory
if not MODELS_DIR.exists():
    MODELS_DIR = BASE_DIR.parent / 'ai-model' / 'ML Model'


class PolicySimulator:
    """
    Policy Simulator class that uses trained ML models to predict outcomes
    """
    
    def __init__(self):
        """Initialize simulator by loading models and encoders"""
        self.revenue_model = None
        self.success_model = None
        self.encoders_direct = None
        self.encoders_success = None
        self.fossil_fuel_model = None
        self.fossil_fuel_encoders = None
        self.fossil_fuel_deltas = None
        self._dataset_cache = None  # Cache for main dataset
        self._load_models()
        self._load_encoders()
        self._load_fossil_fuel_model()
    
    def _load_models(self):
        """Load trained ML models with validation"""
        try:
            # Load revenue model - try multiple possible names
            revenue_model_paths = [
                MODELS_DIR / 'revenue_model_gb.pkl',
                MODELS_DIR / 'revenue_gb.pkl',
                MODELS_DIR / 'gb_direct.pkl'
            ]
            for path in revenue_model_paths:
                if path.exists():
                    file_size = path.stat().st_size
                    if file_size == 0:
                        print(f"[WARN] Skipping empty file: {path}")
                        continue
                    try:
                        with open(path, 'rb') as f:
                            self.revenue_model = pickle.load(f)
                        print(f"[OK] Loaded revenue model from {path} ({file_size / 1024:.1f} KB)")
                        break
                    except (pickle.UnpicklingError, EOFError) as e:
                        print(f"[WARN] Corrupted pickle file {path}: {e}")
                        continue
                    except Exception as e:
                        print(f"[WARN] Error loading {path}: {e}")
                        continue
            
            # Load success model - try multiple possible names
            success_model_paths = [
                MODELS_DIR / 'success_model_gb.pkl',
                MODELS_DIR / 'success_gb.pkl',
                MODELS_DIR / 'gb_success_final.pkl'
            ]
            for path in success_model_paths:
                if path.exists():
                    file_size = path.stat().st_size
                    if file_size == 0:
                        print(f"[WARN] Skipping empty file: {path}")
                        continue
                    try:
                        with open(path, 'rb') as f:
                            self.success_model = pickle.load(f)
                        print(f"[OK] Loaded success model from {path} ({file_size / 1024:.1f} KB)")
                        break
                    except (pickle.UnpicklingError, EOFError) as e:
                        print(f"[WARN] Corrupted pickle file {path}: {e}")
                        continue
                    except Exception as e:
                        print(f"[WARN] Error loading {path}: {e}")
                        continue
            
            # Validate models were loaded
            if self.revenue_model is None:
                print(f"[ERROR] Revenue model not loaded. Looking in: {MODELS_DIR}")
                print("   Expected files: revenue_model_gb.pkl, revenue_gb.pkl, or gb_direct.pkl")
            if self.success_model is None:
                print(f"[ERROR] Success model not loaded. Looking in: {MODELS_DIR}")
                print("   Expected files: success_model_gb.pkl, success_gb.pkl, or gb_success_final.pkl")
                
        except Exception as e:
            print(f"[ERROR] Error loading models: {e}")
            print(f"   Looking in: {MODELS_DIR}")
    
    def _load_encoders(self):
        """Load label encoders with validation"""
        try:
            # Load direct encoders (for revenue model)
            encoders_direct_path = ENCODERS_DIR / 'encoders_direct.pkl'
            if encoders_direct_path.exists():
                file_size = encoders_direct_path.stat().st_size
                if file_size == 0:
                    print(f"[WARN] Skipping empty file: {encoders_direct_path}")
                else:
                    try:
                        with open(encoders_direct_path, 'rb') as f:
                            self.encoders_direct = pickle.load(f)
                        print(f"[OK] Loaded encoders_direct from {encoders_direct_path} ({file_size} bytes)")
                    except (pickle.UnpicklingError, EOFError) as e:
                        print(f"[WARN] Corrupted encoder file {encoders_direct_path}: {e}")
                    except Exception as e:
                        print(f"[WARN] Error loading encoders_direct: {e}")
            else:
                print(f"[WARN] encoders_direct.pkl not found in {ENCODERS_DIR}")
            
            # Load success encoders (for success model)
            encoders_success_path = ENCODERS_DIR / 'encoders_success.pkl'
            if encoders_success_path.exists():
                file_size = encoders_success_path.stat().st_size
                if file_size == 0:
                    print(f"[WARN] Skipping empty file: {encoders_success_path}")
                else:
                    try:
                        with open(encoders_success_path, 'rb') as f:
                            self.encoders_success = pickle.load(f)
                        print(f"[OK] Loaded encoders_success from {encoders_success_path} ({file_size} bytes)")
                    except (pickle.UnpicklingError, EOFError) as e:
                        print(f"[WARN] Corrupted encoder file {encoders_success_path}: {e}")
                    except Exception as e:
                        print(f"[WARN] Error loading encoders_success: {e}")
            else:
                print(f"[WARN] encoders_success.pkl not found in {ENCODERS_DIR}")
                
        except Exception as e:
            print(f"[ERROR] Error loading encoders: {e}")
            print(f"   Looking in: {ENCODERS_DIR}")
    
    def _load_fossil_fuel_model(self):
        """Load fossil fuel dependency ML model and encoders"""
        try:
            # Load fossil fuel model
            fossil_model_path = MODELS_DIR / 'fossil_fuel_model.pkl'
            if fossil_model_path.exists():
                file_size = fossil_model_path.stat().st_size
                if file_size == 0:
                    print(f"[WARN] Fossil fuel model file is empty: {fossil_model_path}")
                else:
                    try:
                        with open(fossil_model_path, 'rb') as f:
                            self.fossil_fuel_model = pickle.load(f)
                        print(f"[OK] Loaded fossil fuel model from {fossil_model_path} ({file_size / 1024:.1f} KB)")
                    except (pickle.UnpicklingError, EOFError) as e:
                        print(f"[WARN] Corrupted fossil fuel model file {fossil_model_path}: {e}")
                    except Exception as e:
                        print(f"[WARN] Error loading fossil fuel model: {e}")
            else:
                print(f"[WARN] fossil_fuel_model.pkl not found in {MODELS_DIR}")
                print("   Run: python scripts/train_fossil_fuel_model.py to train the model")
            
            # Load fossil fuel encoders and deltas
            fossil_encoders_path = ENCODERS_DIR / 'fossil_fuel_encoders.pkl'
            fossil_deltas_path = MODELS_DIR / 'fossil_fuel_deltas.pkl'
            
            if fossil_encoders_path.exists():
                file_size = fossil_encoders_path.stat().st_size
                if file_size == 0:
                    print(f"[WARN] Fossil fuel encoders file is empty: {fossil_encoders_path}")
                else:
                    try:
                        with open(fossil_encoders_path, 'rb') as f:
                            self.fossil_fuel_encoders = pickle.load(f)
                        print(f"[OK] Loaded fossil fuel encoders from {fossil_encoders_path}")
                    except (pickle.UnpicklingError, EOFError) as e:
                        print(f"[WARN] Corrupted fossil fuel encoders file: {e}")
                    except Exception as e:
                        print(f"[WARN] Error loading fossil fuel encoders: {e}")
            else:
                print(f"[WARN] fossil_fuel_encoders.pkl not found in {ENCODERS_DIR}")
            
            if fossil_deltas_path.exists():
                file_size = fossil_deltas_path.stat().st_size
                if file_size == 0:
                    print(f"[WARN] Fossil fuel deltas file is empty: {fossil_deltas_path}")
                else:
                    try:
                        with open(fossil_deltas_path, 'rb') as f:
                            deltas_data = pickle.load(f)
                            self.fossil_fuel_deltas = deltas_data
                        print(f"[OK] Loaded fossil fuel deltas from {fossil_deltas_path}")
                    except (pickle.UnpicklingError, EOFError) as e:
                        print(f"[WARN] Corrupted fossil fuel deltas file: {e}")
                    except Exception as e:
                        print(f"[WARN] Error loading fossil fuel deltas: {e}")
            else:
                print(f"[WARN] fossil_fuel_deltas.pkl not found in {MODELS_DIR}")
                
        except Exception as e:
            print(f"[ERROR] Error loading fossil fuel model: {e}")
    
    def predict_fossil_fuel_share(self, country_name, year):
        """
        Predict fossil fuel dependency share (%) for a country and year using ML model
        
        Args:
            country_name (str): Country name
            year (int): Year
            
        Returns:
            float: Predicted fossil fuel share percentage (0-100), or None if model not available
        """
        if self.fossil_fuel_model is None or self.fossil_fuel_encoders is None:
            return None
        
        try:
            # Get country metadata
            region = get_country_region(country_name)
            income_group = get_country_income_group(country_name)
            
            # Encode features
            country_encoder = self.fossil_fuel_encoders.get('country_encoder')
            region_encoder = self.fossil_fuel_encoders.get('region_encoder')
            income_encoder = self.fossil_fuel_encoders.get('income_encoder')
            
            if not all([country_encoder, region_encoder, income_encoder]):
                print(f"[WARN] Missing encoders for fossil fuel prediction")
                return None
            
            # Check if country is in encoder (handle unseen countries)
            country_standardized = standardize_country_name(country_name)
            if country_standardized not in country_encoder.classes_:
                print(f"[WARN] Country '{country_name}' not in fossil fuel model encoder, using regional fallback")
                return None
            
            # Encode
            country_encoded = country_encoder.transform([country_standardized])[0]
            region_encoded = region_encoder.transform([region])[0] if region in region_encoder.classes_ else 0
            income_encoded = income_encoder.transform([income_group])[0] if income_group in income_encoder.classes_ else 0
            
            # Prepare feature vector: [year, country_encoded, region_encoded, income_encoded]
            X = np.array([[year, country_encoded, region_encoded, income_encoded]])
            
            # Predict
            fossil_share = self.fossil_fuel_model.predict(X)[0]
            
            # Validate: ensure between 0 and 100
            fossil_share = max(0, min(100, fossil_share))
            
            return float(fossil_share)
            
        except Exception as e:
            print(f"[WARN] Error predicting fossil fuel share for {country_name} {year}: {e}")
            return None
    
    def get_fossil_fuel_yearly_delta(self, country_name, region=None):
        """
        Get average yearly delta (change) in fossil fuel share for a country or region
        
        Args:
            country_name (str): Country name
            region (str, optional): Region name (used as fallback)
            
        Returns:
            float: Average yearly delta in percentage points, or None if not available
        """
        if self.fossil_fuel_deltas is None:
            return None
        
        try:
            country_deltas = self.fossil_fuel_deltas.get('country_deltas', {})
            region_deltas = self.fossil_fuel_deltas.get('region_deltas', {})
            
            # Try country first
            country_standardized = standardize_country_name(country_name)
            if country_standardized in country_deltas:
                return float(country_deltas[country_standardized])
            
            # Fallback to region
            if region is None:
                region = get_country_region(country_name)
            
            if region in region_deltas:
                print(f"[INFO] Using regional delta for {country_name} (region: {region})")
                return float(region_deltas[region])
            
            # Final fallback: global average (use median of all country deltas if available)
            if country_deltas:
                global_avg = np.median(list(country_deltas.values()))
                print(f"[INFO] Using global median delta for {country_name}")
                return float(global_avg)
            
            return None
            
        except Exception as e:
            print(f"[WARN] Error getting fossil fuel delta for {country_name}: {e}")
            return None
    
    def predict_fossil_fuel_time_series(self, country_name, start_year, duration_years, carbon_price=None):
        """
        Predict fossil fuel dependency time series for multiple years
        
        Uses ML-learned baseline + optional policy adjustment
        
        Args:
            country_name (str): Country name
            start_year (int): Starting year
            duration_years (int): Number of years to predict
            carbon_price (float, optional): Carbon price in USD/ton (for policy adjustment)
            
        Returns:
            list: List of dicts with {'year': int, 'fossil_pct': float, 'is_ml_baseline': bool}
        """
        time_series = []
        region = get_country_region(country_name)
        
        # Get baseline prediction and delta
        baseline_fossil_share = self.predict_fossil_fuel_share(country_name, start_year)
        yearly_delta = self.get_fossil_fuel_yearly_delta(country_name, region)
        
        # Fallback if ML model not available
        if baseline_fossil_share is None:
            # Use hardcoded fallback (region-based)
            if region == 'East Asia & Pacific':
                baseline_fossil_share = 75.0
            elif region == 'North America':
                baseline_fossil_share = 80.0
            elif region == 'Europe & Central Asia':
                baseline_fossil_share = 65.0
            else:
                baseline_fossil_share = 70.0
            yearly_delta = -0.5  # Default: gradual decrease
            print(f"[WARN] Fossil fuel ML model not available, using fallback values for {country_name}")
        
        if yearly_delta is None:
            yearly_delta = -0.5  # Default: gradual decrease
        
        # Policy adjustment factor (if carbon price provided)
        # This is a rule-based adjustment, NOT ML-learned
        policy_factor = 1.0
        if carbon_price is not None and carbon_price > 0:
            # Higher carbon price → faster transition away from fossil fuels
            # This is a simple heuristic (can be refined)
            if carbon_price >= 50:
                policy_factor = 1.5  # Accelerate transition
            elif carbon_price >= 25:
                policy_factor = 1.2
            elif carbon_price >= 10:
                policy_factor = 1.1
        
        adjusted_delta = yearly_delta * policy_factor
        
        # Generate time series
        current_fossil_share = baseline_fossil_share
        for year_offset in range(duration_years):
            year = start_year + year_offset
            
            # For first year, use ML prediction (if available)
            if year_offset == 0 and baseline_fossil_share is not None:
                fossil_pct = baseline_fossil_share
                is_ml_baseline = True
            else:
                # Project forward using adjusted delta
                fossil_pct = current_fossil_share + adjusted_delta
                fossil_pct = max(0, min(100, fossil_pct))  # Clamp to [0, 100]
                is_ml_baseline = False
            
            time_series.append({
                'year': year,
                'fossil_pct': round(fossil_pct, 2),
                'is_ml_baseline': is_ml_baseline
            })
            
            current_fossil_share = fossil_pct
        
        return time_series
    
    def _load_main_dataset(self):
        """Load the main dataset for country data lookup"""
        if self._dataset_cache is not None:
            return self._dataset_cache
        
        dataset_paths = [
            BASE_DIR.parent / 'ai-model' / 'dataset' / 'processed' / 'ecoimpact_complete_dataset.csv',
            BASE_DIR / 'data' / 'ecoimpact_complete_dataset.csv',
        ]
        
        for dataset_path in dataset_paths:
            if dataset_path.exists():
                try:
                    import pandas as pd
                    self._dataset_cache = pd.read_csv(dataset_path)
                    print(f"[INFO] Loaded main dataset from {dataset_path}")
                    return self._dataset_cache
                except Exception as e:
                    print(f"[WARN] Could not load dataset from {dataset_path}: {e}")
                    continue
        
        return None
    
    def _get_country_data_from_dataset(self, country_name, year, region, income_group):
        """
        Get GDP, Population, Fossil Fuel Dependency from main dataset
        Uses region and income_group as fallback if exact country match not found
        """
        df = self._load_main_dataset()
        
        if df is None:
            # Fallback to old method if dataset not available
            gdp = get_country_gdp(country_name, year)
            population = get_country_population(country_name, year)
            fossil_fuel_dep = get_fossil_fuel_dependency(country_name, year)
            
            if population is not None and population > 0:
                population_log = np.log(population)
            else:
                population_log = 18.5
            
            if gdp is None:
                gdp = 1.0e12
            if fossil_fuel_dep is None:
                fossil_fuel_dep = 70.0
                
            return gdp, population, fossil_fuel_dep, population_log
        
        # Try exact country match first
        country_data = df[(df['Jurisdiction'] == country_name) & (df['Year'] == year)]
        
        # If not found, try previous years (up to 5 years back)
        if country_data.empty and year > 2019:
            for prev_year in range(year - 1, max(year - 6, 2019), -1):
                country_data = df[(df['Jurisdiction'] == country_name) & (df['Year'] == prev_year)]
                if not country_data.empty:
                    break
        
        # If still not found, try region + income group match (use median for that group)
        if country_data.empty and region and income_group:
            group_data = df[(df['Region'] == region) & (df['Income group'] == income_group) & (df['Year'] == year)]
            if group_data.empty and year > 2019:
                for prev_year in range(year - 1, max(year - 6, 2019), -1):
                    group_data = df[(df['Region'] == region) & (df['Income group'] == income_group) & (df['Year'] == prev_year)]
                    if not group_data.empty:
                        break
            if not group_data.empty:
                # Use median values for this region/income group (better than just first row)
                median_row = group_data.median(numeric_only=True)
                # Create a single-row dataframe with median values
                country_data = group_data.iloc[[0]].copy()
                for col in ['GDP', 'Population', 'Population_Log', 'Fossil_Fuel_Dependency_%']:
                    if col in median_row:
                        country_data[col] = median_row[col]
        
        # Extract values
        if not country_data.empty:
            row = country_data.iloc[0]
            gdp = float(row.get('GDP', np.nan)) if pd.notna(row.get('GDP')) else None
            population = float(row.get('Population', np.nan)) if pd.notna(row.get('Population')) else None
            fossil_fuel_dep = float(row.get('Fossil_Fuel_Dependency_%', np.nan)) if pd.notna(row.get('Fossil_Fuel_Dependency_%')) else None
            population_log = float(row.get('Population_Log', np.nan)) if pd.notna(row.get('Population_Log')) else None
            
            # If Population_Log not directly available, calculate it
            if population_log is None and population is not None and population > 0:
                population_log = np.log(population)
        else:
            gdp = None
            population = None
            fossil_fuel_dep = None
            population_log = None
        
        # Safe defaults if still None (should rarely happen now)
        if population is not None and population > 0:
            if population_log is None:
                population_log = np.log(population)
        else:
            # Region/Income group based defaults
            if region == 'East Asia & Pacific' and income_group == 'Upper middle income':
                population_log = 19.0  # ~180M people
                population = np.exp(19.0)
            elif region == 'North America' and income_group == 'High income':
                population_log = 18.3  # ~85M people
                population = np.exp(18.3)
            elif region == 'Europe & Central Asia' and income_group == 'High income':
                population_log = 18.2  # ~80M people
                population = np.exp(18.2)
            else:
                population_log = 18.5  # ~100M default
                population = np.exp(18.5)
            print(f"[WARN] Population not found for {country_name} {year}, using region/income-based default: {population_log:.2f}")
        
        if gdp is None:
            # Region/Income group based defaults
            if income_group == 'High income':
                gdp = 4.0e12  # 4 trillion USD
            elif income_group == 'Upper middle income':
                gdp = 1.5e12  # 1.5 trillion USD
            else:
                gdp = 0.5e12  # 500 billion USD
            print(f"[WARN] GDP not found for {country_name} {year}, using income-group-based default: {gdp/1e12:.2f} trillion")
        
        if fossil_fuel_dep is None:
            # Region-based defaults
            if region == 'East Asia & Pacific':
                fossil_fuel_dep = 75.0
            elif region == 'North America':
                fossil_fuel_dep = 80.0
            elif region == 'Europe & Central Asia':
                fossil_fuel_dep = 65.0
            else:
                fossil_fuel_dep = 70.0
            print(f"[WARN] Fossil fuel dependency not found for {country_name} {year}, using region-based default: {fossil_fuel_dep}%")
        
        return gdp, population, fossil_fuel_dep, population_log
    
    def get_country_co2_emissions(self, country_name, year):
        """
        Get annual CO2 emissions for a country and year
        Tries main dataset first, then external CO2 CSV file
        
        Args:
            country_name (str): Country name
            year (int): Year
            
        Returns:
            float: CO2 emissions in tonnes, or None if not found
        """
        # First try main dataset
        df = self._load_main_dataset()
        
        if df is not None:
            # Try exact country match
            country_data = df[(df['Jurisdiction'] == country_name) & (df['Year'] == year)]
            
            # If not found, try previous years (up to 5 years back)
            if country_data.empty and year > 2019:
                for prev_year in range(year - 1, max(year - 6, 2019), -1):
                    country_data = df[(df['Jurisdiction'] == country_name) & (df['Year'] == prev_year)]
                    if not country_data.empty:
                        break
            
            if not country_data.empty:
                row = country_data.iloc[0]
                co2_emissions = row.get('Annual_CO2_emissions', None)
                if pd.notna(co2_emissions) and co2_emissions > 0:
                    return float(co2_emissions)
        
        # If not found in main dataset, try external CO2 CSV file
        try:
            from utils.data_loader import load_co2_data
            co2_df = load_co2_data()
            
            # CO2 CSV uses 'Entity' column, not 'Country'
            entity_col = 'Entity' if 'Entity' in co2_df.columns else 'Country'
            emissions_col = 'Annual CO₂ emissions' if 'Annual CO₂ emissions' in co2_df.columns else 'CO2_emissions'
            
            if entity_col in co2_df.columns and emissions_col in co2_df.columns:
                # Try exact match
                country_data = co2_df[(co2_df[entity_col] == country_name) & (co2_df['Year'] == year)]
                
                # If not found, try previous years
                if country_data.empty and year > 2019:
                    for prev_year in range(year - 1, max(year - 6, 2019), -1):
                        country_data = co2_df[(co2_df[entity_col] == country_name) & (co2_df['Year'] == prev_year)]
                        if not country_data.empty:
                            break
                
                if not country_data.empty:
                    co2_emissions = country_data.iloc[0][emissions_col]
                    if pd.notna(co2_emissions) and co2_emissions > 0:
                        return float(co2_emissions)
        except Exception as e:
            print(f"[WARN] Could not load CO2 data from external CSV: {e}")
        
        return None
    
    def prepare_features(self, policy_data):
        """
        Prepare input features for model prediction
        
        Args:
            policy_data (dict): Policy input data containing:
                - duration (int): Number of years
                - policyType (str): 'carbonTax' or 'ets'
                - carbonPrice (float): Carbon price in USD/tonCO2
                - country (str): Country name
                - year (int): Starting year (optional, defaults to current year)
        
        Returns:
            dict: Prepared features for revenue and success models
        """
        # Standardize country name
        country = standardize_country_name(policy_data['country'])
        year = policy_data.get('year', 2024)
        
        # Get country metadata (now guaranteed to return non-None values)
        region = get_country_region(country)
        income_group = get_country_income_group(country)
        
        # Validate metadata (should never be None due to fallbacks, but double-check)
        if region is None:
            region = 'East Asia & Pacific'  # Final safety fallback
        if income_group is None:
            income_group = 'Upper middle income'  # Final safety fallback
        
        # Get data from the main dataset (which already has all the data we need)
        # This is more reliable than loading from separate CSV files
        gdp, population, fossil_fuel_dep, population_log = self._get_country_data_from_dataset(
            country, year, region, income_group
        )
        
        # Map policy type - NOTE: encoder expects 'Carbon tax' (lowercase 'tax') not 'Carbon Tax'
        policy_type = 'Carbon tax' if policy_data['policyType'] == 'carbonTax' else 'ETS'
        
        # Prepare revenue model features
        revenue_features = {
            'Type': policy_type,
            'Region': region,
            'Income group': income_group,
            'Year': year,
            'Carbon_Price_USD': policy_data['carbonPrice'],
            'Fossil_Fuel_Dependency_%': fossil_fuel_dep,
            'Population_Log': population_log,
            'GDP': gdp
        }
        
        # Prepare success model features (must match training features)
        # Training features: Type, Region, Income group, Year, Fossil_Fuel_Dependency_%, GDP (6 features)
        # NOTE: Carbon_Price_USD was NOT used in training, so we don't include it
        success_features = {
            'Type': policy_type,
            'Region': region,
            'Income group': income_group,
            'Year': year,
            'Fossil_Fuel_Dependency_%': fossil_fuel_dep,
            'GDP': gdp
        }
        
        return {
            'revenue': revenue_features,
            'success': success_features
        }
    
    def encode_features(self, features, encoder_type='direct'):
        """
        Encode categorical features using label encoders with validation
        
        Args:
            features (dict): Feature dictionary
            encoder_type (str): 'direct' for revenue model, 'success' for success model
        
        Returns:
            np.array: Encoded feature array (guaranteed no NaN)
        """
        encoders = self.encoders_direct if encoder_type == 'direct' else self.encoders_success
        
        if not encoders:
            raise ValueError(f"Encoders for {encoder_type} not loaded")
        
        # Create a copy to avoid modifying original
        encoded_features = features.copy()
        
        # Validate and encode categorical features
        categorical_features = ['Type', 'Region', 'Income group']
        missing_fields = []
        
        for feature in categorical_features:
            if feature in encoded_features and feature in encoders:
                value = encoded_features[feature]
                if value is None:
                    missing_fields.append(feature)
                    # This should never happen now due to fallbacks, but handle it
                    raise ValueError(
                        f"Feature '{feature}' is None. Cannot encode. "
                        f"Country metadata resolution failed. Missing fields: {missing_fields}"
                    )
                try:
                    encoded_features[feature] = encoders[feature].transform([value])[0]
                except ValueError as e:
                    # Provide helpful error message with valid values
                    if hasattr(encoders[feature], 'classes_'):
                        valid_classes = list(encoders[feature].classes_)
                        raise ValueError(
                            f"Feature '{feature}' value '{value}' not in encoder classes. "
                            f"Valid values: {valid_classes}. "
                            f"This indicates a mismatch between input data and training data."
                        )
                    raise
        
        # Convert to array in correct feature order
        if encoder_type == 'direct':
            feature_order = ['Type', 'Region', 'Income group', 'Year', 
                           'Carbon_Price_USD', 'Fossil_Fuel_Dependency_%', 
                           'Population_Log', 'GDP']
        else:
            # Success model feature order: Type, Region, Income group, Year, Fossil_Fuel_Dependency_%, GDP (6 features)
            feature_order = ['Type', 'Region', 'Income group', 'Year', 
                           'Fossil_Fuel_Dependency_%', 'GDP']
        
        # Build feature array and validate for NaN
        feature_array = np.array([[encoded_features[f] for f in feature_order]], dtype=float)
        
        # Final validation: check for NaN or inf
        if np.isnan(feature_array).any():
            nan_indices = np.where(np.isnan(feature_array[0]))[0]
            nan_features = [feature_order[i] for i in nan_indices]
            raise ValueError(
                f"NaN values detected in feature array. Missing features: {nan_features}. "
                f"This should not happen - please check data loading logic."
            )
        
        if np.isinf(feature_array).any():
            inf_indices = np.where(np.isinf(feature_array[0]))[0]
            inf_features = [feature_order[i] for i in inf_indices]
            raise ValueError(
                f"Inf values detected in feature array. Features: {inf_features}. "
                f"This indicates invalid numeric values (e.g., log(0))."
            )
        
        return feature_array
    
    def predict_coverage(self, policy_data):
        """
        Predict emission coverage percentage using country-sensitive features
        
        Uses a heuristic-based approach that varies by country characteristics.
        This mimics the behavior of an ML model trained on:
        - Type, Region, Income group, Year, Fossil_Fuel_Dependency_%, 
        - Population_Log, Annual_CO2_emissions, GDP, Carbon_Price_USD
        
        Args:
            policy_data (dict): Policy input data
        
        Returns:
            float: Predicted coverage percentage (0-100)
        """
        features = self.prepare_features(policy_data)['revenue']
        
        # Extract features
        region = features['Region']
        income_group = features['Income group']
        policy_type = features['Type']
        carbon_price = features['Carbon_Price_USD']
        fossil_fuel_dep = features['Fossil_Fuel_Dependency_%']
        gdp = features['GDP']
        population_log = features['Population_Log']
        year = features.get('Year', 2024)
        
        # Get CO2 emissions for additional context
        co2_emissions = self.get_country_co2_emissions(
            policy_data['country'], 
            year
        )
        
        # Base coverage by region (developed regions tend to have higher coverage)
        region_base = {
            'Europe & Central Asia': 52.0,
            'North America': 48.0,
            'East Asia & Pacific': 42.0,
            'Latin America & Caribbean': 38.0,
            'Middle East & North Africa': 32.0,
            'Sub-Saharan Africa': 28.0
        }
        base_coverage = region_base.get(region, 40.0)
        
        # Income group adjustment (strong effect)
        income_adjustment = {
            'High income': 12.0,
            'Upper middle income': 6.0,
            'Lower middle income': 0.0,
            'Low income': -8.0
        }
        base_coverage += income_adjustment.get(income_group, 0.0)
        
        # Policy type adjustment (ETS typically covers more sectors)
        if policy_type == 'ETS':
            base_coverage += 7.0
        else:  # Carbon tax
            base_coverage += 0.0
        
        # Carbon price adjustment (higher price = more coverage, but diminishing returns)
        # Scale: $0-50/ton = 0-10% boost, $50-100 = 10-18% boost, $100+ = 18-20% boost
        if carbon_price <= 50:
            price_factor = carbon_price / 50.0 * 0.4  # 0 to 0.4
        elif carbon_price <= 100:
            price_factor = 0.4 + (carbon_price - 50) / 50.0 * 0.3  # 0.4 to 0.7
        else:
            price_factor = 0.7 + min((carbon_price - 100) / 100.0 * 0.2, 0.2)  # 0.7 to 0.9 max
        
        base_coverage += price_factor * 25.0  # Up to 22.5% increase for very high prices
        
        # Fossil fuel dependency adjustment (higher dependency = more emissions to cover, but also more resistance)
        # Inverse relationship: countries with less fossil dependency can cover more easily
        fossil_factor = (100 - fossil_fuel_dep) / 100.0  # 1.0 for 0% fossil, 0.0 for 100% fossil
        base_coverage += fossil_factor * 8.0  # Up to 8% adjustment
        
        # GDP scale adjustment (log scale)
        if gdp > 0:
            gdp_log = np.log10(gdp)
            # Larger economies (GDP > $1T) tend to have more comprehensive coverage
            if gdp_log > 12.5:  # GDP > ~3.2 trillion
                base_coverage += 4.0
            elif gdp_log > 12:  # GDP > 1 trillion
                base_coverage += 2.5
            elif gdp_log > 11.5:  # GDP > ~316 billion
                base_coverage += 1.0
        
        # Population adjustment (larger populations may have different coverage patterns)
        if population_log > 19:  # > ~180M people
            base_coverage += 1.5
        elif population_log > 18:  # > ~60M people
            base_coverage += 0.5
        
        # Year trend (more recent years tend to have higher coverage as policies mature)
        if year >= 2020:
            base_coverage += (year - 2020) * 0.3  # +0.3% per year after 2020
        
        # CO2 emissions adjustment (larger emitters may have different coverage patterns)
        if co2_emissions is not None and co2_emissions > 0:
            emissions_log = np.log10(co2_emissions)
            # Very large emitters (> 1 billion tons) may have different patterns
            if emissions_log > 9:  # > 1 billion tons
                base_coverage -= 2.0  # Slightly harder to cover very large emissions
            elif emissions_log > 8.5:  # > ~316 million tons
                base_coverage += 0.5
        
        # Clamp to valid range [0, 100]
        coverage = max(0.0, min(100.0, base_coverage))
        
        return float(coverage)
    
    def predict_revenue(self, policy_data):
        """
        Predict revenue using revenue model
        
        Args:
            policy_data (dict): Policy input data
        
        Returns:
            float: Predicted revenue in million USD
        """
        if not self.revenue_model:
            raise ValueError("Revenue model not loaded")
        
        features = self.prepare_features(policy_data)['revenue']
        encoded_features = self.encode_features(features, encoder_type='direct')
        prediction = self.revenue_model.predict(encoded_features)[0]
        return prediction
    
    def predict_success(self, policy_data):
        """
        Predict success probability using success model
        
        Args:
            policy_data (dict): Policy input data
        
        Returns:
            dict: Success prediction with probability and status
        """
        if not self.success_model:
            raise ValueError("Success model not loaded")
        
        features = self.prepare_features(policy_data)['success']
        
        # Debug: Log features to verify they vary by country
        country_name = policy_data.get('country', 'Unknown')
        print(f"[SUCCESS MODEL] Prediction for {country_name}:")
        print(f"  Raw Features: Type={features.get('Type')}, Region={features.get('Region')}, "
              f"Income={features.get('Income group')}, Year={features.get('Year')}, "
              f"Fossil_Fuel_Dep={features.get('Fossil_Fuel_Dependency_%'):.2f}%, "
              f"GDP={features.get('GDP'):.2e}")
        
        encoded_features = self.encode_features(features, encoder_type='success')
        
        # Log encoded vector for debugging (checksum to detect if identical)
        import numpy as np
        encoded_sum = float(np.sum(encoded_features))
        encoded_str = ','.join([f'{x:.4f}' for x in encoded_features.flatten()])
        print(f"  Encoded vector (shape={encoded_features.shape}, sum={encoded_sum:.4f}): [{encoded_str[:100]}...]")
        
        # Verify we're using the actual ML model
        if self.success_model is None:
            raise ValueError("Success model is None - cannot make prediction")
        
        print(f"  Using ML model: {type(self.success_model).__name__}")
        
        # Get probability
        # Model classes are: ['Abolished', 'Implemented']
        # Class 0 = Abolished (bad outcome - policy fails)
        # Class 1 = Implemented (good outcome - policy succeeds)
        proba = self.success_model.predict_proba(encoded_features)[0]
        abolished_prob = proba[0]  # Probability of abolishment (class 0 - BAD)
        success_prob = proba[1]  # Probability of success/implementation (class 1 - GOOD)
        
        print(f"  Probabilities: Abolished={abolished_prob:.3f}, Success={success_prob:.3f}")
        
        # Determine risk level based on abolishment probability (as per notebook logic)
        # Low abolishment probability = Low Risk (policy likely to succeed)
        # High abolishment probability = High Risk (policy likely to fail)
        if abolished_prob < 0.35:
            risk = 'low'
            status = 'Low Risk'
        elif abolished_prob < 0.65:
            risk = 'medium'
            status = 'Medium Risk'
        else:
            risk = 'high'
            status = 'High Risk'
        
        print(f"  Risk: {status} (abolishment prob: {abolished_prob:.1%})")
        
        # Return success probability (probability of implementation/success) for display
        # This is what the user sees, so 90% means 90% chance of success
        return {
            'probability': float(success_prob),  # Probability of success (for display)
            'risk': risk,
            'status': status
        }
    
    def simulate_policy(self, policy_data):
        """
        Run complete simulation for a policy
        
        Args:
            policy_data (dict): Policy input data
        
        Returns:
            dict: Complete simulation results
        """
        try:
            revenue = self.predict_revenue(policy_data)
            success = self.predict_success(policy_data)
            
            # Calculate CO2 reduction (placeholder - adjust based on your model)
            co2_reduction = None  # You may need a separate model for this
            
            return {
                'revenue_million_usd': revenue,
                'success_probability': success['probability'],
                'risk_level': success['risk'],
                'status': success['status'],
                'co2_reduction_percent': co2_reduction
            }
        except Exception as e:
            print(f"Error in simulation: {e}")
            raise


def simulate_policy(policy_data):
    """
    Convenience function to run a policy simulation
    
    Args:
        policy_data (dict): Policy input data
    
    Returns:
        dict: Simulation results
    """
    simulator = PolicySimulator()
    return simulator.simulate_policy(policy_data)

