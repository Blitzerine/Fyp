import Plot from 'react-plotly.js';
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../App';
import { getChartTheme } from '../../../utils/chartTheme';

export default function FinancialSection({ results }) {
  const { theme } = useTheme();
  const [chartTheme, setChartTheme] = useState(getChartTheme());
  const projections = results.projections || [];

  // Debounce chart theme update - wait 2 seconds after last theme change
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartTheme(getChartTheme());
    }, 2000); // Wait 2 seconds after theme change

    return () => clearTimeout(timer); // Clear timer if theme changes again
  }, [theme]);
  const years = projections.map(p => p.year);
  const cumulativeRevenues = projections.map(p => p.cumulative_revenue_million || 0);
  
  let cumulativeRiskAdjusted = 0;
  const cumulativeRiskAdjustedValues = projections.map(p => {
    cumulativeRiskAdjusted += (p.risk_adjusted_value_million || 0);
    return cumulativeRiskAdjusted;
  });

  // Rebuild chart data when theme changes - use useMemo to force recreation
  const revenueData = useMemo(() => [{
    x: years,
    y: cumulativeRevenues,
    name: 'Cumulative Revenue',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: chartTheme.seriesColors.primary, width: 3 },
    marker: { size: 8, color: chartTheme.seriesColors.primary },
    hovertemplate: 'Year %{x}<br>Cumulative Revenue: $%{y:.2f}M<extra></extra>'
  }, {
    x: years,
    y: cumulativeRiskAdjustedValues,
    name: 'Cumulative Risk-Adjusted Value',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: chartTheme.seriesColors.warning, width: 3, dash: 'dash' },
    marker: { size: 8, color: chartTheme.seriesColors.warning, symbol: 'diamond' },
    hovertemplate: 'Year %{x}<br>Cumulative Risk-Adjusted: $%{y:.2f}M<extra></extra>'
  }], [years, cumulativeRevenues, cumulativeRiskAdjustedValues, chartTheme, theme]);

  // Rebuild layout when theme changes - use useMemo to force recreation
  const revenueLayout = useMemo(() => ({
    xaxis: {
      title: 'Year',
      color: chartTheme.fontColor,
      gridcolor: chartTheme.gridColor,
      titlefont: { size: 10, color: chartTheme.fontColor },
      tickfont: { size: 9, color: chartTheme.fontColor }
    },
    yaxis: {
      title: 'Cumulative Revenue (Million USD)',
      color: chartTheme.fontColor,
      gridcolor: chartTheme.gridColor,
      titlefont: { size: 10, color: chartTheme.fontColor },
      tickfont: { size: 9, color: chartTheme.fontColor }
    },
    paper_bgcolor: chartTheme.paperBg,
    plot_bgcolor: chartTheme.plotBg,
    font: { color: chartTheme.fontColor, size: 9 },
    margin: { l: 60, r: 40, t: 50, b: 60 },
    height: 350,
    legend: {
      x: 0.02,
      y: 1.02,
      xanchor: 'left',
      yanchor: 'bottom',
      bgcolor: chartTheme.legendBg,
      bordercolor: chartTheme.legendBorder,
      borderwidth: 1,
      font: { size: 9, color: chartTheme.fontColor }
    }
  }), [chartTheme, theme]);

  return (
    <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.25)] transition-all duration-300 overflow-hidden">
      <div className="p-5 border-b border-[rgba(0,255,111,0.1)]">
        <h2 className="text-[#00FF6F] text-xl font-bold uppercase tracking-wide">Financial Analysis</h2>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-[rgba(10,13,11,0.6)] rounded-lg p-4 border border-[rgba(0,255,111,0.1)]">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Expected Revenue</p>
            <p className="text-[#00FF6F] text-2xl font-bold">${results.revenue_million?.toFixed(2)}M</p>
            <p className="text-gray-500 text-[10px] mt-1">Per year</p>
          </div>

          <div className="bg-[rgba(10,13,11,0.6)] rounded-lg p-4 border border-[rgba(255,187,36,0.1)]">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Risk-Adjusted</p>
            <p className="text-yellow-400 text-2xl font-bold">${results.risk_adjusted_value_million?.toFixed(2)}M</p>
            <p className="text-gray-500 text-[10px] mt-1">{results.abolishment_risk_percent?.toFixed(1)}% risk</p>
          </div>
        </div>

        {projections.length > 0 && (
          <div className="bg-[rgba(10,13,11,0.4)] rounded-lg p-4 border border-[rgba(0,255,111,0.1)]">
            <h3 className="text-gray-300 text-sm font-semibold mb-3">Revenue Trend</h3>
            <Plot
              key={`financial-${theme}`}
              data={revenueData}
              layout={{...revenueLayout, height: 320, margin: { l: 50, r: 30, t: 20, b: 55 }}}
              config={{ displayModeBar: false, responsive: true }}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
