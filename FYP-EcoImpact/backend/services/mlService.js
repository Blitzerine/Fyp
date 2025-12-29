const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');

/**
 * ML Model Service
 * Handles communication with the Python ML model
 */

// Option 1: Call Python script directly (if model is a script)
exports.runSimulation = async (simulationData) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../../ai-model/ML Model/model.py');
    const python = process.env.PYTHON_PATH || 'python3';
    
    // Prepare input data for the model
    const inputData = JSON.stringify(simulationData);
    
    const pythonProcess = spawn(python, [pythonScript, inputData]);
    
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script error: ${errorOutput}`));
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse model output: ${output}`));
      }
    });
  });
};

// Option 2: Call ML model API (if running as separate service)
exports.runSimulationAPI = async (simulationData) => {
  try {
    const response = await axios.post(
      `${process.env.ML_MODEL_SERVICE_URL || 'http://localhost:8000'}/predict`,
      simulationData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`ML Model API error: ${error.message}`);
  }
};

// Mock simulation for testing (remove when real model is integrated)
exports.runMockSimulation = async (simulationData) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { duration, policyType, carbonPrice, country } = simulationData;
  
  // Generate mock results
  const results = {
    success: true,
    inputs: {
      duration,
      policyType,
      carbonPrice: parseFloat(carbonPrice),
      country
    },
    predictions: {
      gdpImpact: {
        value: (Math.random() * 2 - 1).toFixed(2), // -1% to +1%
        unit: '%',
        trend: 'positive'
      },
      co2Reduction: {
        value: (Math.random() * 15 + 5).toFixed(2), // 5-20%
        unit: '%',
        trend: 'positive'
      },
      employmentChange: {
        value: (Math.random() * 3 - 1).toFixed(2), // -1% to +2%
        unit: '%',
        trend: Math.random() > 0.5 ? 'positive' : 'negative'
      },
      costOfLiving: {
        value: (Math.random() * 2 + 0.5).toFixed(2), // 0.5-2.5%
        unit: '%',
        trend: 'negative'
      }
    },
    timeline: Array.from({ length: duration }, (_, i) => ({
      year: new Date().getFullYear() + i,
      gdp: (Math.random() * 2 - 1).toFixed(2),
      co2: (Math.random() * 15 + 5).toFixed(2),
      employment: (Math.random() * 3 - 1).toFixed(2),
      costOfLiving: (Math.random() * 2 + 0.5).toFixed(2)
    }))
  };
  
  return results;
};

// Mock simulation that returns data in the format expected by the frontend
exports.runMockSimulationForFrontend = async (simulationData) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { country, policyType, carbonPriceUSD, durationYears } = simulationData;
  
  // Generate realistic mock predictions based on carbon price
  const baseCoverage = Math.min(60, Math.max(20, carbonPriceUSD * 2)); // 20-60% based on price
  const baseRevenue = carbonPriceUSD * 50; // Revenue scales with price
  
  // Add some randomness
  const emissionCoveragePct = baseCoverage + (Math.random() * 10 - 5);
  const annualRevenueMillionUSD = baseRevenue + (Math.random() * 200 - 100);
  
  // Mock country context (simplified)
  const mockCountryContext = {
    population: 231402117, // Example: Pakistan
    gdpPPP: 1200000000000,
    annualCO2Tons: 227000000,
    fossilFuelDependencyPct: 64.3,
    energyMixKwhPerCapita: {
      coal: 450,
      oil: 320,
      gas: 280,
      nuclear: 50,
      hydro: 180,
      wind: 45,
      solar: 25,
      otherRenewables: 15
    },
    region: "South Asia",
    incomeGroup: "Lower middle income"
  };
  
  // Mock similar policies
  const mockSimilarPolicies = [
    {
      name: "British Columbia Carbon Tax",
      country: "Canada",
      region: "North America",
      actualCoveragePct: 70.0,
      actualRevenueMillionUSD: 1800.0,
      actualPriceUSD: 50
    },
    {
      name: "UK Carbon Price Floor",
      country: "United Kingdom",
      region: "Europe",
      actualCoveragePct: 35.0,
      actualRevenueMillionUSD: 2200.0,
      actualPriceUSD: 25
    }
  ];
  
  return {
    predictions: {
      emissionCoveragePct: Math.max(0, Math.min(100, emissionCoveragePct)),
      annualRevenueMillionUSD: Math.max(0, annualRevenueMillionUSD),
      confidence: {
        coverageLow: Math.max(0, emissionCoveragePct - 5),
        coverageHigh: Math.min(100, emissionCoveragePct + 5),
        revenueLow: Math.max(0, annualRevenueMillionUSD - 150),
        revenueHigh: annualRevenueMillionUSD + 150
      }
    },
    countryContext: mockCountryContext,
    similarPolicies: mockSimilarPolicies
  };
};



