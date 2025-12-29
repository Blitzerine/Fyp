const mlService = require('../services/mlService');
const axios = require('axios');

// @desc    Run policy simulation
// @route   POST /api/simulate
// @access  Private
exports.runSimulation = async (req, res) => {
  try {
    // Accept both old format (duration, carbonPrice) and new format (durationYears, carbonPriceUSD)
    const { 
      duration, 
      durationYears, 
      policyType, 
      carbonPrice, 
      carbonPriceUSD, 
      country 
    } = req.body;

    // Normalize field names to new format
    const finalDuration = durationYears || duration;
    const finalCarbonPrice = carbonPriceUSD || carbonPrice;
    const finalPolicyType = policyType; // Keep as-is, will normalize below

    // Validation
    if (!finalDuration || !finalPolicyType || finalCarbonPrice === undefined || finalCarbonPrice === null || !country) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: country, policyType (CARBON_TAX or ETS), carbonPriceUSD, durationYears'
      });
    }

    // Validate duration
    if (finalDuration < 1 || finalDuration > 20) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 1 and 20 years'
      });
    }

    // Normalize policy type: accept CARBON_TAX, Carbon Tax, carbonTax, etc.
    let normalizedPolicyType = finalPolicyType.toUpperCase();
    if (normalizedPolicyType === 'CARBON_TAX' || normalizedPolicyType === 'CARBONTAX') {
      normalizedPolicyType = 'CARBON_TAX';
    } else if (normalizedPolicyType === 'ETS') {
      normalizedPolicyType = 'ETS';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Policy type must be either CARBON_TAX or ETS'
      });
    }

    // Try to call FastAPI ML backend first
    let mlResults = null;
    try {
      const fastApiUrl = process.env.ML_MODEL_SERVICE_URL || 'http://localhost:8000';
      const fastApiResponse = await axios.post(
        `${fastApiUrl}/api/simulate`,
        {
          country: country,
          policy_type: normalizedPolicyType === 'CARBON_TAX' ? 'Carbon Tax' : 'ETS',
          carbon_price: parseFloat(finalCarbonPrice),
          duration: parseInt(finalDuration),
          year: new Date().getFullYear()
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      // Transform FastAPI response to frontend format
      const fastApiData = fastApiResponse.data;
      const yearlyPredictions = fastApiData.yearly_predictions || [];
      const firstYearRevenue = yearlyPredictions.length > 0 ? yearlyPredictions[0].revenue_million_usd : 0;
      const averageRevenue = yearlyPredictions.length > 0 
        ? yearlyPredictions.reduce((sum, p) => sum + p.revenue_million_usd, 0) / yearlyPredictions.length 
        : firstYearRevenue;
      
      mlResults = {
        predictions: {
          emissionCoveragePct: yearlyPredictions[0]?.coverage || 45.0, // Use first year coverage or default
          annualRevenueMillionUSD: averageRevenue,
          confidence: {
            coverageLow: (yearlyPredictions[0]?.coverage || 45.0) * 0.85,
            coverageHigh: (yearlyPredictions[0]?.coverage || 45.0) * 1.15,
            revenueLow: averageRevenue * 0.8,
            revenueHigh: averageRevenue * 1.2
          }
        },
        countryContext: {}, // FastAPI doesn't return this yet
        similarPolicies: [] // FastAPI doesn't return this yet
      };
      
      console.log('✅ FastAPI ML backend responded successfully');
    } catch (fastApiError) {
      console.warn('⚠️ FastAPI ML backend not available, using mock data:', fastApiError.message);
      // Will use mock data below
    }

    // If FastAPI failed, use mock data
    if (!mlResults) {
      mlResults = await mlService.runMockSimulationForFrontend({
        country,
        policyType: normalizedPolicyType,
        carbonPriceUSD: parseFloat(finalCarbonPrice),
        durationYears: parseInt(finalDuration)
      });
    }

    // Transform to frontend expected format
    const response = {
      inputs: {
        country: country,
        policyType: normalizedPolicyType,
        carbonPriceUSD: parseFloat(finalCarbonPrice),
        durationYears: parseInt(finalDuration)
      },
      predictions: mlResults.predictions || {
        emissionCoveragePct: 0,
        annualRevenueMillionUSD: 0
      },
      countryContext: mlResults.countryContext || {},
      similarPolicies: mlResults.similarPolicies || []
    };

    res.status(200).json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to run simulation'
    });
  }
};



