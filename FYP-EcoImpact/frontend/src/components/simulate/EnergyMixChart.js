import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

function EnergyMixChart({ countryContext }) {
  const energyMix = countryContext?.energyMixKwhPerCapita || {};
  const fossilFuelDependency = countryContext?.fossilFuelDependencyPct || null;

  const COLORS = {
    coal: '#8B4513',
    oil: '#1a1a1a',
    gas: '#4A90E2',
    nuclear: '#FFD700',
    hydro: '#0066CC',
    wind: '#87CEEB',
    solar: '#FFA500',
    otherRenewables: '#90EE90'
  };

  const data = [
    { name: 'Coal', value: energyMix.coal || 0, color: COLORS.coal },
    { name: 'Oil', value: energyMix.oil || 0, color: COLORS.oil },
    { name: 'Gas', value: energyMix.gas || 0, color: COLORS.gas },
    { name: 'Nuclear', value: energyMix.nuclear || 0, color: COLORS.nuclear },
    { name: 'Hydro', value: energyMix.hydro || 0, color: COLORS.hydro },
    { name: 'Wind', value: energyMix.wind || 0, color: COLORS.wind },
    { name: 'Solar', value: energyMix.solar || 0, color: COLORS.solar },
    { name: 'Other Renewables', value: energyMix.otherRenewables || 0, color: COLORS.otherRenewables }
  ].filter(item => item.value > 0);

  const totalEnergy = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalEnergy > 0 ? ((data.value / totalEnergy) * 100).toFixed(1) : 0;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{data.name}</p>
          <p>{`${data.value.toFixed(0)} kWh/capita`}</p>
          <p>{`${percentage}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Energy Mix Breakdown</h3>
      {fossilFuelDependency !== null && (
        <div className="fossil-fuel-indicator">
          <span className="fossil-fuel-label">Fossil Fuel Dependency:</span>
          <span className="fossil-fuel-value">{fossilFuelDependency.toFixed(4)}%</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EnergyMixChart;


