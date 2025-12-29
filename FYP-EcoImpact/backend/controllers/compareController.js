const mlService = require('../services/mlService');

// @desc    Compare two policies
// @route   POST /api/compare
// @access  Private
exports.comparePolicies = async (req, res) => {
  try {
    const { policyOne, policyTwo } = req.body;

    // Validation
    if (!policyOne || !policyTwo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both policyOne and policyTwo'
      });
    }

    const requiredFields = ['duration', 'policyType', 'carbonPrice', 'country'];
    
    for (const field of requiredFields) {
      if (!policyOne[field] || !policyTwo[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field} in one or both policies`
        });
      }
    }

    // Validate durations
    if (policyOne.duration < 1 || policyOne.duration > 20 || 
        policyTwo.duration < 1 || policyTwo.duration > 20) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 1 and 20 years for both policies'
      });
    }

    // Validate policy types
    if (!['carbonTax', 'ets'].includes(policyOne.policyType) ||
        !['carbonTax', 'ets'].includes(policyTwo.policyType)) {
      return res.status(400).json({
        success: false,
        message: 'Policy type must be either carbonTax or ets'
      });
    }

    // Run simulations for both policies
    // For now, using mock data. Replace with actual ML model calls:
    // const resultsOne = await mlService.runSimulation({
    //   ...policyOne,
    //   userId: req.user.id
    // });
    // const resultsTwo = await mlService.runSimulation({
    //   ...policyTwo,
    //   userId: req.user.id
    // });

    const [resultsOne, resultsTwo] = await Promise.all([
      mlService.runMockSimulation({ ...policyOne, userId: req.user.id }),
      mlService.runMockSimulation({ ...policyTwo, userId: req.user.id })
    ]);

    // Calculate comparison metrics
    const comparison = {
      policyOne: {
        inputs: {
          duration: policyOne.duration,
          policyType: policyOne.policyType,
          carbonPrice: parseFloat(policyOne.carbonPrice),
          country: policyOne.country
        },
        results: resultsOne
      },
      policyTwo: {
        inputs: {
          duration: policyTwo.duration,
          policyType: policyTwo.policyType,
          carbonPrice: parseFloat(policyTwo.carbonPrice),
          country: policyTwo.country
        },
        results: resultsTwo
      },
      comparison: {
        gdpImpact: {
          difference: (parseFloat(resultsTwo.predictions.gdpImpact.value) - 
                      parseFloat(resultsOne.predictions.gdpImpact.value)).toFixed(2),
          winner: parseFloat(resultsTwo.predictions.gdpImpact.value) > 
                  parseFloat(resultsOne.predictions.gdpImpact.value) ? 'policyTwo' : 'policyOne'
        },
        co2Reduction: {
          difference: (parseFloat(resultsTwo.predictions.co2Reduction.value) - 
                      parseFloat(resultsOne.predictions.co2Reduction.value)).toFixed(2),
          winner: parseFloat(resultsTwo.predictions.co2Reduction.value) > 
                  parseFloat(resultsOne.predictions.co2Reduction.value) ? 'policyTwo' : 'policyOne'
        }
      }
    };

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to compare policies'
    });
  }
};





