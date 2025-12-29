// Mock simulation response for development/testing
export const mockSimulationResponse = {
  inputs: {
    country: "Pakistan",
    policyType: "CARBON_TAX",
    carbonPriceUSD: 25,
    durationYears: 5
  },
  predictions: {
    emissionCoveragePct: 45.2,
    annualRevenueMillionUSD: 1250.5,
    confidence: {
      coverageLow: 38.5,
      coverageHigh: 52.8,
      revenueLow: 980.2,
      revenueHigh: 1520.8
    }
  },
  countryContext: {
    population: 231402117,
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
  },
  similarPolicies: [
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
    },
    {
      name: "Colombia Carbon Tax",
      country: "Colombia",
      region: "South America",
      actualCoveragePct: 50.0,
      actualRevenueMillionUSD: 450.0,
      actualPriceUSD: 15
    }
  ]
};



