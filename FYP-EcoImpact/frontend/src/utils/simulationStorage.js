/**
 * Utility functions for storing and retrieving simulation results
 */

const STORAGE_KEY = 'ecoimpact_simulations';

/**
 * Save a simulation result to localStorage
 * @param {Object} simulationResult - The simulation result to save
 * @returns {string} - ID of the saved simulation
 */
export const saveSimulation = (simulationResult) => {
  try {
    const simulations = getSimulations();
    const newSimulation = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...simulationResult
    };
    
    simulations.push(newSimulation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations));
    
    return newSimulation.id;
  } catch (error) {
    console.error('Error saving simulation:', error);
    throw error;
  }
};

/**
 * Get all saved simulations
 * @returns {Array} - Array of saved simulations
 */
export const getSimulations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving simulations:', error);
    return [];
  }
};

/**
 * Remove a simulation by ID
 * @param {string} id - ID of the simulation to remove
 */
export const removeSimulation = (id) => {
  try {
    const simulations = getSimulations();
    const filtered = simulations.filter(sim => sim.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing simulation:', error);
    throw error;
  }
};

/**
 * Clear all simulations
 */
export const clearAllSimulations = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing simulations:', error);
    throw error;
  }
};

/**
 * Transform simulation result to comparison table format
 * @param {Object} simulationResult - The simulation result
 * @returns {Object} - Formatted data for comparison table
 */
export const formatSimulationForComparison = (simulationResult) => {
  const { inputs, predictions, countryContext, success } = simulationResult;
  
  // Calculate CO₂ Covered from revenue and carbon price
  // Formula: CO2_covered_tons = (annual_revenue_usd / carbon_price_usd_per_ton)
  const annualRevenueMillionUSD = predictions?.annualRevenueMillionUSD || 0;
  const carbonPriceUSD = inputs?.carbonPriceUSD || 0;
  let co2CoveredMillionTons = null;
  if (annualRevenueMillionUSD > 0 && carbonPriceUSD > 0) {
    const annualRevenueUSD = annualRevenueMillionUSD * 1000000; // Convert to USD
    const co2CoveredTons = annualRevenueUSD / carbonPriceUSD;
    co2CoveredMillionTons = co2CoveredTons / 1000000; // Convert to million tons
  }
  
  // Calculate Revenue as % of GDP
  const revenueUSD = annualRevenueMillionUSD * 1000000;
  const gdpUSD = countryContext?.gdpUSD || countryContext?.gdpPPP || null;
  let revenuePctGDP = null;
  if (gdpUSD && gdpUSD > 0) {
    revenuePctGDP = (revenueUSD / gdpUSD) * 100;
  }
  
  return {
    id: simulationResult.id,
    timestamp: simulationResult.timestamp,
    country: inputs?.country || '',
    policyType: inputs?.policyType === 'CARBON_TAX' ? 'Carbon Tax' : 'ETS',
    carbonPrice: carbonPriceUSD,
    duration: inputs?.durationYears || 0,
    annualRevenue: annualRevenueMillionUSD,
    co2Covered: co2CoveredMillionTons,
    revenuePctGDP: revenuePctGDP,
    successProbability: success?.success_probability || null,
    riskLevel: success?.risk_level || null,
    status: success?.status || null
  };
};

