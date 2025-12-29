"""
Data Loader Utility
Loads external CSV data (CO2, GDP, population, energy mix) for calculations
"""

import pandas as pd
import os
from pathlib import Path


# Get the base directory (backend folder)
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'

# Fallback: if data directory doesn't exist here, try parent directory
if not DATA_DIR.exists():
    DATA_DIR = BASE_DIR.parent / 'ai-model' / 'dataset'


def load_co2_data():
    """
    Load CO2 emissions data by country
    
    Returns:
        pd.DataFrame: CO2 emissions data
    """
    co2_path = DATA_DIR / 'annual_co2_per_country' / 'annual-co2-emissions-per-country.csv'
    if co2_path.exists():
        return pd.read_csv(co2_path)
    else:
        raise FileNotFoundError(f"CO2 data not found at {co2_path}")


def load_gdp_data():
    """
    Load GDP data by country
    
    Returns:
        pd.DataFrame: GDP data
    """
    gdp_path = DATA_DIR / 'gdp_data' / 'gdp-penn-world-table.csv'
    if gdp_path.exists():
        return pd.read_csv(gdp_path)
    else:
        raise FileNotFoundError(f"GDP data not found at {gdp_path}")


def load_population_data():
    """
    Load population data by country
    
    Returns:
        pd.DataFrame: Population data
    """
    pop_path = DATA_DIR / 'population_dataset' / 'population.csv'
    if pop_path.exists():
        return pd.read_csv(pop_path)
    else:
        raise FileNotFoundError(f"Population data not found at {pop_path}")


def load_energy_mix_data():
    """
    Load energy mix data by country
    
    Returns:
        pd.DataFrame: Energy mix data
    """
    energy_path = DATA_DIR / 'energy_mix_dataset' / 'per-capita-energy-stacked.csv'
    if energy_path.exists():
        return pd.read_csv(energy_path)
    else:
        raise FileNotFoundError(f"Energy mix data not found at {energy_path}")


def get_country_co2(country_name, year):
    """
    Get CO2 emissions for a specific country and year
    
    Args:
        country_name (str): Country name
        year (int): Year
        
    Returns:
        float: CO2 emissions value or None
    """
    try:
        df = load_co2_data()
        # Adjust column names based on actual CSV structure
        # This is a template - adjust based on your actual data structure
        result = df[(df['Country'] == country_name) & (df['Year'] == year)]
        if not result.empty:
            return result.iloc[0]['CO2_emissions']  # Adjust column name
        return None
    except Exception as e:
        print(f"Error loading CO2 data: {e}")
        return None


def get_country_gdp(country_name, year):
    """
    Get GDP for a specific country and year
    
    Args:
        country_name (str): Country name
        year (int): Year
        
    Returns:
        float: GDP value or None
    """
    try:
        df = load_gdp_data()
        # Adjust column names based on actual CSV structure
        result = df[(df['Country'] == country_name) & (df['Year'] == year)]
        if not result.empty:
            return result.iloc[0]['GDP']  # Adjust column name
        return None
    except Exception as e:
        print(f"Error loading GDP data: {e}")
        return None


def get_country_population(country_name, year):
    """
    Get population for a specific country and year
    
    Args:
        country_name (str): Country name
        year (int): Year
        
    Returns:
        float: Population value or None
    """
    try:
        df = load_population_data()
        # Adjust column names based on actual CSV structure
        result = df[(df['Country'] == country_name) & (df['Year'] == year)]
        if not result.empty:
            return result.iloc[0]['Population']  # Adjust column name
        return None
    except Exception as e:
        print(f"Error loading population data: {e}")
        return None


def get_fossil_fuel_dependency(country_name, year):
    """
    Get fossil fuel dependency percentage for a specific country and year
    
    Args:
        country_name (str): Country name
        year (int): Year
        
    Returns:
        float: Fossil fuel dependency percentage or None
    """
    try:
        df = load_energy_mix_data()
        # Adjust column names based on actual CSV structure
        result = df[(df['Country'] == country_name) & (df['Year'] == year)]
        if not result.empty:
            # Calculate fossil fuel dependency from energy mix data
            # Adjust based on your actual data structure
            return result.iloc[0]['Fossil_Fuel_Dependency']  # Adjust column name
        return None
    except Exception as e:
        print(f"Error loading energy mix data: {e}")
        return None

