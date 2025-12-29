import React from 'react';

function SummaryCards({ predictions, countryContext, success, carbonPriceUSD }) {
  // Calculate metrics
  const annualRevenueMillionUSD = predictions?.annualRevenueMillionUSD || 0;
  
  // CO₂ Covered calculation - derived from revenue and carbon price
  // Formula: CO2_covered_tons = (annual_revenue_usd / carbon_price_usd_per_ton)
  // This is consistent with revenue model output
  let co2CoveredMillionTons = null;
  if (annualRevenueMillionUSD > 0 && carbonPriceUSD && carbonPriceUSD > 0) {
    const annualRevenueUSD = annualRevenueMillionUSD * 1000000; // Convert to USD
    const co2CoveredTons = annualRevenueUSD / carbonPriceUSD;
    co2CoveredMillionTons = co2CoveredTons / 1000000; // Convert to million tons
  }
  
  // Revenue as % of GDP
  // Use backend-calculated value if available, otherwise calculate
  const revenueUSD = annualRevenueMillionUSD * 1000000;
  const gdpUSD = countryContext?.gdpUSD || countryContext?.gdpPPP || null;
  let revenuePctGDP = null;
  if (gdpUSD && gdpUSD > 0) {
    revenuePctGDP = (revenueUSD / gdpUSD) * 100;
  }

  const formatNumber = (num, decimals = 1) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(num);
  };

  // Get success model outputs
  const successProbability = success?.success_probability;
  const riskLevel = success?.risk_level;
  const status = success?.status;
  
  // Determine risk color
  const getRiskColor = (risk) => {
    if (!risk) return '#888888';
    if (risk === 'low') return '#00FF6F';
    if (risk === 'medium') return '#FFC107';
    return '#FF4444'; // high
  };
  
  const getRiskIcon = (risk) => {
    if (!risk) return '?';
    if (risk === 'low') return '✓';
    if (risk === 'medium') return '!';
    return '⚠'; // high
  };

  const cards = [
    {
      title: 'Annual Revenue',
      value: formatCurrency(annualRevenueMillionUSD * 1000000),
      subtitle: 'ML-based',
      color: '#01D6DF'
    },
    {
      title: 'Policy Success',
      value: successProbability !== null && successProbability !== undefined
        ? `${formatNumber(successProbability * 100, 1)}%`
        : 'N/A',
      subtitle: status ? `${status} (ML-based)` : 'ML-based',
      color: getRiskColor(riskLevel),
      icon: getRiskIcon(riskLevel)
    },
    {
      title: 'CO₂ Covered',
      value: co2CoveredMillionTons !== null && co2CoveredMillionTons > 0 
        ? `${formatNumber(co2CoveredMillionTons, 2)}M tons/year`
        : 'N/A',
      subtitle: 'Calculated',
      color: '#00FF6F',
      tooltip: 'Annual revenue / Carbon price (derived from revenue model)'
    },
    {
      title: 'Revenue as % of GDP',
      value: revenuePctGDP !== null && revenuePctGDP > 0 && revenuePctGDP < 100
        ? `${formatNumber(revenuePctGDP, 2)}%`
        : 'N/A',
      subtitle: 'Calculated',
      color: '#01D6DF',
      tooltip: 'Annual revenue / GDP × 100'
    }
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`summary-card ${card.tooltip ? 'summary-card-with-tooltip' : ''}`}
          data-tooltip={card.tooltip || ''}
        >
          <div className="summary-card-header">
            <h3 className="summary-card-title">
              {card.title}
              {card.icon && <span style={{ marginLeft: '8px', fontSize: '18px' }}>{card.icon}</span>}
            </h3>
            <span className="summary-card-subtitle">{card.subtitle}</span>
          </div>
          <div className="summary-card-value" style={{ color: card.color }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;


