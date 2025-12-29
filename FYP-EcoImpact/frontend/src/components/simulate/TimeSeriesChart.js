import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';

function TimeSeriesChart({ durationYears, predictions, yearStart = 2024 }) {
  // Generate data points for each year (Revenue only - Coverage removed)
  const data = [];
  const annualRevenueMillionUSD = predictions?.annualRevenueMillionUSD || 0;
  const confidence = predictions?.confidence;

  for (let i = 1; i <= durationYears; i++) {
    const year = yearStart + i - 1;
    const revenueLow = confidence?.revenueLow || annualRevenueMillionUSD * 0.8;
    const revenueHigh = confidence?.revenueHigh || annualRevenueMillionUSD * 1.2;
    
    data.push({
      year: year,
      revenue: annualRevenueMillionUSD,
      revenueLow: revenueLow,
      revenueHigh: revenueHigh
    });
  }

  const formatValue = (value) => {
    return `$${value.toFixed(1)}M`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{`Year: ${payload[0].payload.year}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatValue(entry.value, entry.dataKey)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Time Series Projection</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#01D6DF" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#01D6DF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="year" 
            stroke="rgba(255, 255, 255, 0.6)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.6)"
            style={{ fontSize: '12px' }}
            label={{ value: 'Revenue ($M)', angle: -90, position: 'insideLeft', fill: '#01D6DF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {/* Revenue confidence lines */}
          {confidence && (
            <>
              <Line
                type="monotone"
                dataKey="revenueHigh"
                stroke="#01D6DF"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                opacity={0.5}
                name="Revenue High"
              />
              <Line
                type="monotone"
                dataKey="revenueLow"
                stroke="#01D6DF"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                opacity={0.5}
                name="Revenue Low"
              />
            </>
          )}
          
          {/* Revenue line */}
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#01D6DF"
            strokeWidth={3}
            dot={{ fill: '#01D6DF', r: 4 }}
            name="Revenue ($M)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TimeSeriesChart;

