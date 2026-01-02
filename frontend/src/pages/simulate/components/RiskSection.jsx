import Plot from 'react-plotly.js';
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../App';
import { getChartTheme } from '../../../utils/chartTheme';

export default function RiskSection({ results }) {
  const { theme } = useTheme();
  const [chartTheme, setChartTheme] = useState(getChartTheme());
  const survivalProbability = 100 - results.abolishment_risk_percent;

  // Debounce chart theme update - wait 2 seconds after last theme change
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartTheme(getChartTheme());
    }, 2000); // Wait 2 seconds after theme change

    return () => clearTimeout(timer); // Clear timer if theme changes again
  }, [theme]);

  const riskFactors = useMemo(() => {
    return results.key_risks?.map(risk => {
      const severityMatch = risk.match(/\((\d+)%\)/);
      const severity = severityMatch ? parseInt(severityMatch[1]) : 30;
      const riskText = risk.replace(/\s*\(\d+%\)/, '');

      return {
        text: riskText,
        severity: severity,
        level: severity < 30 ? 'Low' : severity < 60 ? 'Medium' : 'High'
      };
    }) || [];
  }, [results.key_risks]);

  // Rebuild gauge chart data when theme changes - use useMemo to force recreation
  const gaugeData = useMemo(() => [{
    type: 'indicator',
    mode: 'gauge+number+delta',
    value: survivalProbability,
    title: { text: 'Survival Probability', font: { color: chartTheme.fontColor, size: 11 } },
    number: { suffix: '%', font: { color: chartTheme.seriesColors.secondary, size: 32 } },
    gauge: {
      axis: { range: [0, 100], tickwidth: 1, tickcolor: chartTheme.fontColor },
      bar: { color: chartTheme.seriesColors.secondary },
      bgcolor: theme === 'bright' ? chartTheme.seriesColors.accent : '#1a4d45',
      borderwidth: 2,
      bordercolor: chartTheme.seriesColors.secondary,
      steps: [
        { range: [0, 50], color: theme === 'bright' ? '#dc2626' : '#7f1d1d' },
        { range: [50, 75], color: theme === 'bright' ? '#d97706' : '#854d0e' },
        { range: [75, 100], color: theme === 'bright' ? '#059669' : '#14532d' }
      ],
      threshold: {
        line: { color: chartTheme.seriesColors.danger, width: 4 },
        thickness: 0.75,
        value: 85
      }
    }
  }], [survivalProbability, chartTheme, theme]);

  // Rebuild gauge layout when theme changes - use useMemo to force recreation
  const gaugeLayout = useMemo(() => ({
    paper_bgcolor: chartTheme.paperBg,
    plot_bgcolor: chartTheme.plotBg,
    font: { color: chartTheme.fontColor, size: 9 },
    margin: { l: 40, r: 40, t: 60, b: 40 },
    height: 300
  }), [chartTheme, theme]);

  // Rebuild risk bar chart data when theme changes - use useMemo to force recreation
  const riskBarData = useMemo(() => [{
    y: riskFactors.map(r => r.text),
    x: riskFactors.map(r => r.severity),
    type: 'bar',
    orientation: 'h',
    marker: {
      color: riskFactors.map(r =>
        r.severity < 30 ? chartTheme.seriesColors.secondary : 
        r.severity < 60 ? chartTheme.seriesColors.warning : 
        chartTheme.seriesColors.danger
      )
    },
    text: riskFactors.map(r => `${r.severity}% - ${r.level}`),
    textposition: 'outside',
    textfont: { color: chartTheme.fontColor },
    hovertemplate: '%{y}: %{x}%<extra></extra>'
  }], [riskFactors, chartTheme, theme]);

  // Rebuild risk bar layout when theme changes - use useMemo to force recreation
  const riskBarLayout = useMemo(() => ({
    xaxis: {
      title: 'Risk Severity (%)',
      range: [0, 100],
      color: chartTheme.fontColor,
      gridcolor: chartTheme.gridColor,
      titlefont: { color: chartTheme.fontColor },
      tickfont: { color: chartTheme.fontColor }
    },
    yaxis: {
      color: chartTheme.fontColor,
      automargin: true,
      tickfont: { color: chartTheme.fontColor }
    },
    paper_bgcolor: chartTheme.paperBg,
    plot_bgcolor: chartTheme.plotBg,
    font: { color: chartTheme.fontColor, size: 11 },
    margin: { l: 180, r: 100, t: 20, b: 50 },
    height: Math.max(200, riskFactors.length * 60)
  }), [chartTheme, riskFactors, theme]);

  return (
    <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.25)] transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-[rgba(0,255,111,0.1)] flex-shrink-0">
        <h2 className="text-[#00FF6F] text-xl font-bold uppercase tracking-wide">Risk Assessment</h2>
      </div>

      <div className="p-5">
        <div className="mb-5">
          <Plot
            key={`gauge-${theme}`}
            data={gaugeData}
            layout={{...gaugeLayout, height: 200, margin: { l: 30, r: 30, t: 40, b: 30 }}}
            config={{ displayModeBar: false, responsive: true }}
            className="w-full"
          />
          <div className="text-center mt-2">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
              results.risk_category === 'Low Risk' ? 'bg-green-900 text-green-400' :
              results.risk_category === 'At Risk' ? 'bg-blue-900 text-blue-400' :
              'bg-red-900 text-red-400'
            }`}>
              {results.risk_category}
            </span>
          </div>
        </div>

        <div className="bg-[rgba(10,13,11,0.4)] rounded-lg p-4 border border-[rgba(0,255,111,0.1)]">
          <h3 className="text-gray-300 text-sm font-semibold mb-3">Context</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {results.context_explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
