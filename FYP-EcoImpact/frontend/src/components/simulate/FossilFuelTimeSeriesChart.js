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

function FossilFuelTimeSeriesChart({ fossilFuelTimeSeries }) {
  if (!fossilFuelTimeSeries || fossilFuelTimeSeries.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Projected Fossil Fuel Dependency</h3>
        <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
          Fossil fuel dependency projection not available
        </p>
      </div>
    );
  }

  // Transform data for chart
  const chartData = fossilFuelTimeSeries.map(item => ({
    year: item.year,
    'Fossil Fuel Dependency': item.fossil_pct,
    isBaseline: item.is_ml_baseline || false
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{`Year: ${data.year}`}</p>
          <p style={{ color: payload[0].color }}>
            {`Fossil Fuel Dependency: ${data['Fossil Fuel Dependency'].toFixed(4)}%`}
          </p>
          {data.isBaseline && (
            <p style={{ fontSize: '0.85em', color: '#888', marginTop: '4px' }}>
              (ML-based baseline)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Projected Fossil Fuel Dependency</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="year" 
            stroke="#00FF6F"
            tick={{ fill: '#00FF6F', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#00FF6F"
            tick={{ fill: '#00FF6F', fontSize: 12 }}
            label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#00FF6F', style: { fontSize: '12px' } }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="Fossil Fuel Dependency"
            stroke="#FF6B6B"
            strokeWidth={2}
            dot={{ fill: '#FF6B6B', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FossilFuelTimeSeriesChart;

