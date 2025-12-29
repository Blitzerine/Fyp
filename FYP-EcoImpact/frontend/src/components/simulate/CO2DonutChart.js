import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

function CO2DonutChart({ predictions, countryContext, carbonPriceUSD }) {
  const annualRevenueMillionUSD = predictions?.annualRevenueMillionUSD || 0;
  const annualCO2Tons = countryContext?.annualCO2Tons || null;
  
  // Calculate CO2 Covered from revenue and carbon price
  // Formula: CO2_covered_tons = (annual_revenue_usd / carbon_price_usd_per_ton)
  let coveredMillionTons = null;
  let uncoveredMillionTons = null;
  
  if (annualRevenueMillionUSD > 0 && carbonPriceUSD && carbonPriceUSD > 0 && annualCO2Tons && annualCO2Tons > 0) {
    const annualRevenueUSD = annualRevenueMillionUSD * 1000000; // Convert to USD
    const coveredTons = annualRevenueUSD / carbonPriceUSD;
    coveredMillionTons = coveredTons / 1000000;
    const totalMillionTons = annualCO2Tons / 1000000;
    uncoveredMillionTons = totalMillionTons - coveredMillionTons;
    
    // Ensure uncovered is not negative
    if (uncoveredMillionTons < 0) {
      uncoveredMillionTons = 0;
    }
  }
  
  // Only show chart if we have valid data
  if (!coveredMillionTons || coveredMillionTons <= 0 || !annualCO2Tons || annualCO2Tons <= 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">CO₂ Coverage</h3>
        <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
          CO₂ coverage data not available for this simulation
        </p>
      </div>
    );
  }

  const data = [
    { name: 'Covered', value: coveredMillionTons, color: '#00FF6F' },
    { name: 'Uncovered', value: uncoveredMillionTons, color: '#666666' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = data.payload.value + (data.payload.name === 'Covered' ? uncoveredMillionTons : coveredMillionTons);
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="chart-tooltip" style={{ fontSize: '11px', padding: '8px 12px' }}>
          <p className="chart-tooltip-label" style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>{data.name}</p>
          <p style={{ fontSize: '11px', margin: '2px 0' }}>{`${data.value.toFixed(2)}M tons/year`}</p>
          <p style={{ fontSize: '11px', margin: '2px 0' }}>{`${percentage}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
    const percentage = (percent * 100).toFixed(1);
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={name === 'Covered' ? '#00FF6F' : '#999'}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="11"
        fontWeight="500"
        fontFamily="Inter, sans-serif"
      >
        {`${name}: ${percentage}%`}
      </text>
    );
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '12px' }}>
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: entry.color, borderRadius: '2px' }}></div>
            <span style={{ color: entry.color, fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title" style={{ fontSize: '16px', marginBottom: '10px' }}>CO₂ Coverage</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={85}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />}
            wrapperStyle={{ fontSize: '11px' }}
          />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CO2DonutChart;


