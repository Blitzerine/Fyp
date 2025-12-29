import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cyberEarthImage from '../images/cyberearth.png';
import { apiPost, getToken } from '../utils/api';
import { mockSimulationResponse } from '../data/mockSimulationData';
import InputPanel from '../components/simulate/InputPanel';
import SummaryCards from '../components/simulate/SummaryCards';
import TimeSeriesChart from '../components/simulate/TimeSeriesChart';
import CO2DonutChart from '../components/simulate/CO2DonutChart';
import SimilarPoliciesPanel from '../components/simulate/SimilarPoliciesPanel';
import DisclaimerBox from '../components/simulate/DisclaimerBox';
import LoadingOverlay from '../components/simulate/LoadingOverlay';
import { saveSimulation } from '../utils/simulationStorage';

function Simulate() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    country: '',
    policyType: 'CARBON_TAX',
    carbonPriceUSD: '',
    durationYears: 5
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError(null);
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (!inputs.country || inputs.country.trim() === '') {
      newErrors.country = 'Country is required';
    }
    
    if (!inputs.carbonPriceUSD || inputs.carbonPriceUSD <= 0) {
      newErrors.carbonPriceUSD = 'Carbon price must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Check if user is logged in
    const token = getToken();
    if (!token || !isLoggedIn) {
      setApiError('Please login to run simulation.');
      // Optionally redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setApiError(null);
    setResults(null);
    setUseMockData(false);

    try {
      // Prepare request body matching FastAPI contract
      const requestBody = {
        country: inputs.country,
        policy_type: inputs.policyType === 'CARBON_TAX' ? 'Carbon Tax' : 'ETS',
        carbon_price: parseFloat(inputs.carbonPriceUSD),
        duration: parseInt(inputs.durationYears),
        year: 2024
      };

      const response = await apiPost('/predict/all', requestBody);

      if (!response.ok) {
        // Handle error response with specific status codes
        let errorMessage = 'Failed to get prediction';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
          
          // Provide user-friendly messages for common errors
          if (response.status === 503) {
            if (errorMessage.includes('models not loaded') || errorMessage.includes('Models not loaded')) {
              errorMessage = 'ML models not loaded. Please train models first.';
            } else if (errorMessage.includes('encoders')) {
              errorMessage = 'ML encoders not loaded. Please ensure models are trained and saved.';
            } else {
              errorMessage = 'Backend service unavailable. Please check if models are loaded.';
            }
          } else if (response.status === 401) {
            errorMessage = 'Please login to run simulation.';
          } else if (response.status === 400) {
            // Keep the detailed validation error from backend
            errorMessage = errorData.detail || errorMessage;
          }
        } catch (e) {
          // If response is not JSON, use status text
          if (response.status === 503) {
            errorMessage = 'Backend service unavailable. Please check if models are loaded.';
          } else if (response.status === 401) {
            errorMessage = 'Please login to run simulation.';
          } else {
            errorMessage = response.statusText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Transform FastAPI response to match frontend expected format
      const transformedData = transformApiResponse(data);
      setResults(transformedData);
      setUseMockData(false);
      setApiError(null);
      
      // Save simulation result for comparison
      try {
        saveSimulation(transformedData);
      } catch (error) {
        console.warn('Failed to save simulation for comparison:', error);
        // Don't fail the simulation if saving fails
      }
    } catch (error) {
      console.error('Simulation error:', error);
      
      // Provide helpful error messages
      let errorMessage = error.message || 'Failed to connect to API.';
      
      // Network/connection errors
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Backend not reachable at http://127.0.0.1:8000. Please ensure FastAPI is running.';
      }
      
      setApiError(errorMessage);
      // Don't show mock data automatically - let user know there's an error
      setUseMockData(false);
    } finally {
      setLoading(false);
    }
  };

  const transformApiResponse = (apiData) => {
    // Transform FastAPI response format to frontend expected format
    const yearlyPredictions = apiData.yearly_predictions || [];
    const firstYear = yearlyPredictions[0] || {};
    
    // Calculate average revenue across all years
    const averageRevenue = yearlyPredictions.length > 0
      ? yearlyPredictions.reduce((sum, p) => sum + (p.revenue_million_usd || 0), 0) / yearlyPredictions.length
      : firstYear.revenue_million_usd || 0;

    // Extract coverage from first year (if available)
    const coverage = firstYear.coverage || null;
    
    // Extract country context from backend response
    const backendCountryContext = apiData.country_context || {};
    const countryContext = {
      annualCO2Tons: backendCountryContext.annualCO2Tons || null,
      gdpUSD: backendCountryContext.gdpUSD || backendCountryContext.gdpPPP || null,
      gdpPPP: backendCountryContext.gdpPPP || backendCountryContext.gdpUSD || null, // Use USD if PPP not available
      population: backendCountryContext.population || null,
      fossilFuelDependencyPct: backendCountryContext.fossilFuelDependencyPct || null,
      region: backendCountryContext.region || null,
      incomeGroup: backendCountryContext.incomeGroup || null
    };

    return {
      inputs: {
        country: apiData.inputs?.country || inputs.country,
        policyType: apiData.inputs?.policy_type === 'Carbon Tax' ? 'CARBON_TAX' : 'ETS',
        carbonPriceUSD: apiData.inputs?.carbon_price || inputs.carbonPriceUSD,
        durationYears: apiData.inputs?.duration || inputs.durationYears
      },
      predictions: {
        annualRevenueMillionUSD: averageRevenue,
        confidence: {
          revenueLow: averageRevenue * 0.8,
          revenueHigh: averageRevenue * 1.2
        }
      },
      success: {
        success_probability: apiData.success_probability || null,
        risk_level: apiData.risk_level || null,
        status: apiData.status || null
      },
      countryContext: countryContext, // Now populated from backend
      similarPolicies: [], // FastAPI doesn't return this yet
      yearlyPredictions: yearlyPredictions // Store yearly predictions for comparison
    };
  };

  return (
    <div className="page-container simulate-page">
      <div className="page-background">
        <div className="cyber-earth-container">
          <img src={cyberEarthImage} alt="Cyber Earth" className="cyber-earth" />
        </div>
      </div>
      <div className="page-content-wrapper">
        <div className="page-content">
          <InputPanel
            inputs={inputs}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            loading={loading}
            errors={errors}
          />

          {apiError && (
            <div className="api-error-notice">
              <p>{apiError}</p>
            </div>
          )}

          {results && (
            <>
              <div className="results-section">
                <h2 className="section-title">Simulation Results</h2>
                
                <SummaryCards
                  predictions={results.predictions}
                  countryContext={results.countryContext}
                  success={results.success}
                  carbonPriceUSD={inputs.carbonPriceUSD}
                />

                <DisclaimerBox />

                <div className="charts-grid">
                  <div className="chart-wrapper">
                    <TimeSeriesChart
                      durationYears={results.inputs.durationYears}
                      predictions={results.predictions}
                      yearStart={2024}
                    />
                  </div>

                  <div className="chart-wrapper">
                    <CO2DonutChart
                      predictions={results.predictions}
                      countryContext={results.countryContext}
                      carbonPriceUSD={inputs.carbonPriceUSD}
                    />
                  </div>
                </div>

                {results.similarPolicies && results.similarPolicies.length > 0 && (
                  <div className="similar-policies-wrapper">
                    <SimilarPoliciesPanel similarPolicies={results.similarPolicies} />
                  </div>
                )}
              </div>
            </>
          )}

          {!results && (
            <div className="page-description">
              <p>
                Configure key policy settings, duration, carbon price, and region. 
                Generate real-time projections of how your climate strategy will affect both the environment and revenue.
              </p>
              <p>
                After running the simulation, Eco-Impact AI displays clear insights on emission coverage, 
                revenue predictions, and CO₂ coverage, supported by interactive charts for deeper analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Simulate;
