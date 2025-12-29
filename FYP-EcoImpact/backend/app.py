"""
FastAPI Backend for EcoImpact AI
Main API server for policy simulation predictions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import sys
from pathlib import Path
import pandas as pd

# Add utils to path
sys.path.append(str(Path(__file__).parent))

from utils.simulator import PolicySimulator

# Initialize FastAPI app
app = FastAPI(
    title="EcoImpact AI API",
    description="Climate Policy Simulator API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",
        "http://localhost:3000",  # React default port
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class PolicyInput(BaseModel):
    """Input model for policy simulation - accepts both snake_case and camelCase"""
    duration: int = Field(..., ge=1, le=20, description="Simulation duration in years (1-20)")
    country: str = Field(..., description="Country name")
    year: Optional[int] = Field(None, description="Starting year (defaults to 2024)")
    policy_type: Optional[str] = Field(None, description="Policy type: 'Carbon Tax' or 'ETS'")
    policyType: Optional[str] = Field(None, description="Policy type (alternative): 'carbonTax' or 'ets'")
    carbon_price: Optional[float] = Field(None, ge=0, description="Carbon price in USD/tonCO2")
    carbonPrice: Optional[float] = Field(None, ge=0, description="Carbon price (alternative) in USD/tonCO2")
    
    class Config:
        populate_by_name = True


class YearlyPrediction(BaseModel):
    """Prediction results for a single year"""
    year: int
    revenue_million_usd: float
    co2_reduction_percent: Optional[float] = None  # CO2 Covered in million tons
    gdp_impact: Optional[float] = None  # Revenue as % of GDP
    employment_impact: Optional[float] = None  # Employment impact (not currently computed, set to None)
    cost_of_living_change: Optional[float] = None  # Cost of living change (not currently computed, set to None)


class SimulationResponse(BaseModel):
    """Complete simulation response"""
    success: bool
    inputs: Dict
    success_probability: float
    risk_level: str
    status: str
    yearly_predictions: List[YearlyPrediction]
    overall_revenue: Optional[float] = None
    overall_co2_reduction: Optional[float] = None
    country_context: Optional[Dict] = None  # Add country context for frontend calculations


# Initialize simulator (will load models on first use)
simulator = None


def get_simulator():
    """Get or initialize the policy simulator"""
    global simulator
    if simulator is None:
        simulator = PolicySimulator()
    return simulator


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "EcoImpact AI API",
        "version": "1.0.0",
        "endpoints": {
            "simulate": "/api/simulate",
            "health": "/api/health"
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint with model loading status"""
    sim = get_simulator()
    models_loaded = (
        sim.revenue_model is not None and 
        sim.success_model is not None and
        sim.encoders_direct is not None and
        sim.encoders_success is not None
    )
    
    return {
        "status": "ok",
        "models_loaded": models_loaded,
        "message": "Server is running" + (" - Models ready" if models_loaded else " - Models not loaded")
    }


@app.post("/api/simulate", response_model=SimulationResponse)
async def simulate_policy(policy_input: PolicyInput):
    """
    Simulate a climate policy and predict outcomes
    
    Args:
        policy_input: Policy input parameters
    
    Returns:
        SimulationResponse: Complete simulation results with yearly predictions
    """
    try:
        # Get simulator instance
        sim = get_simulator()
        
        # Check if models are loaded
        if sim.revenue_model is None or sim.success_model is None:
            raise HTTPException(
                status_code=503,
                detail="ML models not loaded. Please ensure models are saved in backend/models/ directory. See SAVE_MODELS.md for instructions."
            )
        
        if sim.encoders_direct is None or sim.encoders_success is None:
            raise HTTPException(
                status_code=503,
                detail="Encoders not loaded. Please ensure encoders are saved in backend/encoders/ directory. See SAVE_MODELS.md for instructions."
            )
        
        # Normalize policy type - accept both formats
        policy_type_input = policy_input.policy_type or getattr(policy_input, 'policyType', None)
        if not policy_type_input:
            raise HTTPException(status_code=400, detail="policy_type is required")
        
        # Convert to standard format (Carbon Tax or ETS)
        policy_type_map = {
            "carbonTax": "Carbon Tax",
            "Carbon Tax": "Carbon Tax",
            "carbon_tax": "Carbon Tax",
            "ets": "ETS",
            "ETS": "ETS"
        }
        normalized_policy_type = policy_type_map.get(policy_type_input)
        if not normalized_policy_type:
            raise HTTPException(
                status_code=400,
                detail="policy_type must be 'Carbon Tax' or 'ETS' (or 'carbonTax'/'ets')"
            )
        
        # Get carbon price - handle both field name formats
        carbon_price_value = policy_input.carbon_price or policy_input.carbonPrice
        if carbon_price_value is None:
            raise HTTPException(status_code=400, detail="carbon_price or carbonPrice is required")
        
        # Convert input to dict (use normalized format for internal processing)
        policy_data = {
            "duration": policy_input.duration,
            "policyType": "carbonTax" if normalized_policy_type == "Carbon Tax" else "ets",
            "carbonPrice": float(carbon_price_value),
            "country": policy_input.country,
            "year": policy_input.year or 2024
        }
        
        # Initialize results
        yearly_predictions = []
        start_year = policy_data["year"]
        
        # Run simulation for each year
        for year_offset in range(1, policy_data["duration"] + 1):
            current_year = start_year + year_offset - 1
            
            # Update year in policy data
            year_policy_data = policy_data.copy()
            year_policy_data["year"] = current_year
            
            try:
                # Predict revenue
                revenue = sim.predict_revenue(year_policy_data)
                
                # Predict success (only for first year, or recalculate as needed)
                if year_offset == 1:
                    success_result = sim.predict_success(year_policy_data)
                    success_prob = success_result["probability"]
                    risk_level = success_result["risk"]
                    status = success_result["status"]
                else:
                    # You can recalculate success for each year if needed
                    success_result = sim.predict_success(year_policy_data)
                    success_prob = success_result["probability"]
                    risk_level = success_result["risk"]
                    status = success_result["status"]
                
                # Get country data for calculations
                features_data = sim.prepare_features(year_policy_data)
                gdp_usd = features_data['revenue']['GDP']  # GDP in USD (already loaded)
                
                # Get CO2 emissions
                co2_emissions_tons = sim.get_country_co2_emissions(
                    year_policy_data['country'], 
                    current_year
                )
                
                # Calculate CO2 Covered (in million tons) from revenue and carbon price
                # Formula: CO2_covered_tons = (annual_revenue_usd / carbon_price_usd_per_ton)
                co2_covered_million_tons = None
                carbon_price_usd = policy_input.carbon_price or policy_input.carbonPrice
                if revenue > 0 and carbon_price_usd and carbon_price_usd > 0:
                    annual_revenue_usd = revenue * 1e6  # Convert from million USD to USD
                    co2_covered_tons = annual_revenue_usd / carbon_price_usd
                    co2_covered_million_tons = co2_covered_tons / 1e6  # Convert to million tons
                else:
                    # If revenue or price invalid, return None (frontend will show "N/A")
                    co2_covered_million_tons = None
                
                # Calculate Revenue as % of GDP
                # Formula: (annual_revenue_usd / gdp_usd) * 100
                revenue_usd = revenue * 1e6  # Convert from million USD to USD
                revenue_pct_gdp = None
                if gdp_usd is not None and gdp_usd > 0:
                    revenue_pct_gdp = (revenue_usd / gdp_usd) * 100
                else:
                    # If GDP is invalid, return None (frontend will show "N/A")
                    revenue_pct_gdp = None
                
                # Log for debugging
                print(f"[CALC] Year {current_year}: revenue=${revenue:.2f}M, gdp=${gdp_usd/1e12:.2f}T, "
                      f"co2_covered={co2_covered_million_tons:.2f}Mt" if co2_covered_million_tons else f"co2_covered=None, "
                      f"revenue_pct_gdp={revenue_pct_gdp:.4f}%" if revenue_pct_gdp else "revenue_pct_gdp=None")
                
                yearly_predictions.append(YearlyPrediction(
                    year=current_year,
                    revenue_million_usd=float(revenue),
                    co2_reduction_percent=co2_covered_million_tons,  # Store as million tons
                    gdp_impact=revenue_pct_gdp,  # Store as percentage
                    employment_impact=None,  # Not currently computed - no model available
                    cost_of_living_change=None  # Not currently computed - no model available
                ))
                
            except ValueError as e:
                # Handle metadata/resolution errors with structured response
                error_msg = str(e)
                if "Feature" in error_msg and ("None" in error_msg or "not in encoder" in error_msg):
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "error": "Country metadata resolution failed",
                            "country": policy_data["country"],
                            "year": current_year,
                            "message": error_msg,
                            "suggestion": "Please verify the country name matches the dataset format"
                        }
                    )
                raise HTTPException(
                    status_code=500,
                    detail=f"Error predicting for year {current_year}: {error_msg}"
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error predicting for year {current_year}: {str(e)}"
                )
        
        # Calculate overall metrics
        overall_revenue = sum([p.revenue_million_usd for p in yearly_predictions])
        overall_co2_reduction = None  # TODO: Calculate overall CO2 reduction
        
        # Get country context data for frontend (from first year's prediction data)
        first_year_features = sim.prepare_features({
            'country': policy_input.country,
            'policyType': policy_input.policyType or ('carbonTax' if normalized_policy_type == 'Carbon Tax' else 'ets'),
            'carbonPrice': float(carbon_price_value),
            'year': start_year
        })
        
        # Get CO2 emissions
        co2_emissions_tons = sim.get_country_co2_emissions(policy_input.country, start_year)
        gdp_usd = first_year_features['revenue']['GDP']
        region = first_year_features['revenue']['Region']
        income_group = first_year_features['revenue']['Income group']
        
        # Get population and energy mix from dataset if available
        population = None
        energy_mix = {}
        country_data_for_context = None
        
        if sim._dataset_cache is not None:
            country_data_for_context = sim._dataset_cache[
                (sim._dataset_cache['Jurisdiction'] == policy_input.country) & 
                (sim._dataset_cache['Year'] == start_year)
            ]
            if country_data_for_context.empty and start_year > 2019:
                for prev_year in range(start_year - 1, max(start_year - 6, 2019), -1):
                    country_data_for_context = sim._dataset_cache[
                        (sim._dataset_cache['Jurisdiction'] == policy_input.country) & 
                        (sim._dataset_cache['Year'] == prev_year)
                    ]
                    if not country_data_for_context.empty:
                        break
            
            if not country_data_for_context.empty:
                row = country_data_for_context.iloc[0]
                # Get population
                pop_val = row.get('Population')
                if pd.notna(pop_val):
                    population = float(pop_val)
                
                # Get energy mix
                energy_mix = {
                    'coal': float(row.get('Coal per capita (kWh)', 0)) if pd.notna(row.get('Coal per capita (kWh)')) else 0,
                    'oil': float(row.get('Oil per capita (kWh)', 0)) if pd.notna(row.get('Oil per capita (kWh)')) else 0,
                    'gas': float(row.get('Gas per capita (kWh)', 0)) if pd.notna(row.get('Gas per capita (kWh)')) else 0,
                    'nuclear': float(row.get('Nuclear per capita (kWh - equivalent)', 0)) if pd.notna(row.get('Nuclear per capita (kWh - equivalent)')) else 0,
                    'hydro': float(row.get('Hydro per capita (kWh - equivalent)', 0)) if pd.notna(row.get('Hydro per capita (kWh - equivalent)')) else 0,
                    'wind': float(row.get('Wind per capita (kWh - equivalent)', 0)) if pd.notna(row.get('Wind per capita (kWh - equivalent)')) else 0,
                    'solar': float(row.get('Solar per capita (kWh - equivalent)', 0)) if pd.notna(row.get('Solar per capita (kWh - equivalent)')) else 0,
                    'otherRenewables': float(row.get('Other renewables per capita (kWh - equivalent)', 0)) if pd.notna(row.get('Other renewables per capita (kWh - equivalent)')) else 0
                }
        
        # Build country context
        country_context = {
            'annualCO2Tons': float(co2_emissions_tons) if co2_emissions_tons else None,
            'gdpUSD': float(gdp_usd) if gdp_usd else None,
            'gdpPPP': float(gdp_usd) if gdp_usd else None,  # Use USD GDP (PPP not available separately)
            'population': float(population) if population else None,
            'region': region,
            'incomeGroup': income_group,
            'energyMixKwhPerCapita': energy_mix if energy_mix else {}
        }
        
        # Prepare response
        response = SimulationResponse(
            success=True,
            inputs={
                "duration": policy_input.duration,
                "policy_type": normalized_policy_type,
                "carbon_price": float(policy_input.carbon_price or policy_input.carbonPrice),
                "country": policy_input.country,
                "year": start_year
            },
            success_probability=success_prob,
            risk_level=risk_level,
            status=status,
            yearly_predictions=yearly_predictions,
            overall_revenue=overall_revenue,
            overall_co2_reduction=overall_co2_reduction,
            country_context=country_context
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Simulation error: {str(e)}"
        )


# Add /predict/all endpoint (alias for /api/simulate for compatibility)
@app.post("/predict/all", response_model=SimulationResponse)
async def predict_all(policy_input: PolicyInput):
    """
    Alias endpoint for /api/simulate
    Same functionality as simulate_policy endpoint
    """
    return await simulate_policy(policy_input)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

