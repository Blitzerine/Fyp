import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * Comparative time series chart component
 * Displays multiple simulations on a single chart with different colored lines
 */
function ComparativeChart({ 
  title, 
  data, 
  yAxisLabel, 
  dataKey = 'value',
  unit = '',
  noDataMessage = 'Data not available for comparison'
}) {
  // Check if we have any valid data
  const hasData = data && data.length > 0 && data.some(sim => 
    sim.yearlyData && sim.yearlyData.length > 0
  );

  if (!hasData) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
          {noDataMessage}
        </p>
      </div>
    );
  }

  // Prepare chart data - combine all simulations into a single dataset
  const years = new Set();
  data.forEach(sim => {
    if (sim.yearlyData) {
      sim.yearlyData.forEach(point => {
        if (point.year) years.add(point.year);
      });
    }
  });

  const sortedYears = Array.from(years).sort((a, b) => a - b);

  // Create combined data points for each year
  const chartData = sortedYears.map(year => {
    const point = { year };
    data.forEach((sim, index) => {
      const yearData = sim.yearlyData?.find(d => d.year === year);
      const value = yearData ? yearData[dataKey] : null;
      point[sim.label || `sim${index}`] = value;
    });
    return point;
  });

  // Generate colors for each simulation
  const colors = [
    '#01D6DF', // Cyan
    '#00FF6F', // Green
    '#FFC107', // Yellow/Amber
    '#FF6B6B', // Red
    '#9C27B0', // Purple
    '#2196F3'  // Blue
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip" style={{ fontSize: '11px', padding: '8px 12px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
            Year: {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '11px', margin: '2px 0' }}>
              {entry.name}: {entry.value !== null && entry.value !== undefined 
                ? `${Number(entry.value).toFixed(2)}${unit}` 
                : 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title" style={{ fontSize: '16px', marginBottom: '10px' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="year" 
            stroke="rgba(255, 255, 255, 0.6)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.6)"
            style={{ fontSize: '12px' }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#01D6DF', style: { fontSize: '11px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          
          {data.map((sim, index) => {
            const color = colors[index % colors.length];
            const key = sim.label || `sim${index}`;
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6 }}
                name={sim.label || `${sim.country} - ${sim.policyType}`}
                connectNulls={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ComparativeChart;

