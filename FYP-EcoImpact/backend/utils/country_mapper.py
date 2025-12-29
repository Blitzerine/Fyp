"""
Country Mapper Utility
Maps country names to standard format for ML model input
"""

import pandas as pd
from pathlib import Path

# Get the base directory (backend folder)
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'
DATASET_DIR = BASE_DIR.parent / 'ai-model' / 'dataset' / 'processed'

# Country name mappings - maps various country name formats to standard names
COUNTRY_MAPPINGS = {
    # Common variations
    'USA': 'United States',
    'US': 'United States',
    'United States of America': 'United States',
    'UK': 'United Kingdom',
    'UAE': 'United Arab Emirates',
    'South Korea': 'Korea, Rep.',
    'North Korea': 'Korea, Dem. People\'s Rep.',
    
    # Add more mappings as needed
}

# Fallback mappings for countries not in the dataset
# These are used when a country is not found in the dataset
FALLBACK_REGION_MAPPINGS = {
    'Pakistan': 'East Asia & Pacific',
    'United States': 'North America',
    'India': 'South Asia',
    'Bangladesh': 'South Asia',
    'Sri Lanka': 'South Asia',
    'Nepal': 'South Asia',
    'Afghanistan': 'South Asia',
    # Add more common countries as needed
}

FALLBACK_INCOME_GROUP_MAPPINGS = {
    'Pakistan': 'Upper middle income',
    'United States': 'High income',
    'India': 'Lower middle income',
    'Bangladesh': 'Lower middle income',
    'Sri Lanka': 'Upper middle income',
    'Nepal': 'Lower middle income',
    'Afghanistan': 'Lower middle income',
    # Add more common countries as needed
}

# Cache for region and income group mappings (loaded from dataset)
_REGION_CACHE = None
_INCOME_GROUP_CACHE = None


def _load_country_metadata():
    """Load region and income group mappings from dataset"""
    global _REGION_CACHE, _INCOME_GROUP_CACHE
    
    if _REGION_CACHE is not None and _INCOME_GROUP_CACHE is not None:
        return  # Already loaded
    
    _REGION_CACHE = {}
    _INCOME_GROUP_CACHE = {}
    
    # Try to load from dataset CSV
    dataset_paths = [
        DATASET_DIR / 'ecoimpact_complete_dataset.csv',
        BASE_DIR.parent / 'ai-model' / 'dataset' / 'processed' / 'ecoimpact_complete_dataset.csv',
    ]
    
    for dataset_path in dataset_paths:
        if dataset_path.exists():
            try:
                df = pd.read_csv(dataset_path)
                # Create mappings from unique country entries
                # Dataset uses 'Jurisdiction' column, not 'Country'
                if 'Jurisdiction' in df.columns:
                    country_data = df[['Jurisdiction', 'Region', 'Income group']].drop_duplicates(subset=['Jurisdiction'])
                    # Create mappings with both exact match and case-insensitive lookup
                    _REGION_CACHE = {}
                    _INCOME_GROUP_CACHE = {}
                    for _, row in country_data.iterrows():
                        jurisdiction = row['Jurisdiction']
                        region = row['Region']
                        income = row['Income group']
                        _REGION_CACHE[jurisdiction] = region
                        _INCOME_GROUP_CACHE[jurisdiction] = income
                        # Also add lowercase version for case-insensitive lookup
                        _REGION_CACHE[jurisdiction.lower()] = region
                        _INCOME_GROUP_CACHE[jurisdiction.lower()] = income
                elif 'Country' in df.columns:
                    country_data = df[['Country', 'Region', 'Income group']].drop_duplicates(subset=['Country'])
                    _REGION_CACHE = dict(zip(country_data['Country'], country_data['Region']))
                    _INCOME_GROUP_CACHE = dict(zip(country_data['Country'], country_data['Income group']))
                print(f"[INFO] Loaded {len(_REGION_CACHE)} country mappings from dataset")
                break
            except Exception as e:
                print(f"[WARN] Could not load country metadata from {dataset_path}: {e}")
                continue
    
    # If still empty, set some common defaults
    if not _REGION_CACHE:
        print("[WARN] Could not load country metadata from dataset. Using empty mappings.")


def standardize_country_name(country_name):
    """
    Standardize country name to match model training data format
    
    Args:
        country_name (str): Input country name
        
    Returns:
        str: Standardized country name
    """
    if not country_name:
        return None
    
    country_name = country_name.strip()
    
    # Check if we have a direct mapping
    if country_name in COUNTRY_MAPPINGS:
        return COUNTRY_MAPPINGS[country_name]
    
    # Return as-is if no mapping found (assuming it's already standardized)
    return country_name


def get_country_region(country_name):
    """
    Get region for a given country with fallback to default mappings
    
    Args:
        country_name (str): Standardized country name
    
    Returns:
        str: Region name (never None - uses fallback if not found)
    """
    _load_country_metadata()
    standardized = standardize_country_name(country_name)
    if not standardized:
        # Use fallback for original name if standardization failed
        return FALLBACK_REGION_MAPPINGS.get(country_name) or 'East Asia & Pacific'  # Default fallback
    
    # Try exact match first, then case-insensitive, then fallback
    result = (_REGION_CACHE.get(standardized) or 
              _REGION_CACHE.get(standardized.lower()) or
              FALLBACK_REGION_MAPPINGS.get(standardized) or
              FALLBACK_REGION_MAPPINGS.get(country_name))
    
    # Final fallback - never return None
    if result is None:
        result = 'East Asia & Pacific'  # Safe default
    
    return result


def get_country_income_group(country_name):
    """
    Get income group for a given country with fallback to default mappings
    
    Args:
        country_name (str): Standardized country name
    
    Returns:
        str: Income group (never None - uses fallback if not found)
    """
    _load_country_metadata()
    standardized = standardize_country_name(country_name)
    if not standardized:
        # Use fallback for original name if standardization failed
        return FALLBACK_INCOME_GROUP_MAPPINGS.get(country_name) or 'Upper middle income'  # Default fallback
    
    # Try exact match first, then case-insensitive, then fallback
    result = (_INCOME_GROUP_CACHE.get(standardized) or 
              _INCOME_GROUP_CACHE.get(standardized.lower()) or
              FALLBACK_INCOME_GROUP_MAPPINGS.get(standardized) or
              FALLBACK_INCOME_GROUP_MAPPINGS.get(country_name))
    
    # Final fallback - never return None
    if result is None:
        result = 'Upper middle income'  # Safe default
    
    return result



