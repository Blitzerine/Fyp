import React, { useState, useRef, useEffect } from 'react';
import ComparisonTable from './ComparisonTable';
import ComparativeChart from './ComparativeChart';
import ExportMenu from './ExportMenu';
import { formatSimulationForComparison } from '../../utils/simulationStorage';

function CompareGraphs({ simulations, onBack }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showExportMenu]);

  if (!simulations || simulations.length === 0) {
    return (
      <div className="compare-graphs-empty">
        <p>No simulations selected for comparison.</p>
        {onBack && (
          <button 
            className="back-to-compare-btn"
            onClick={onBack}
          >
            Back to Table
          </button>
        )}
      </div>
    );
  }

  // Format simulations for export (after empty check)
  const formattedSimulations = simulations.map(sim => formatSimulationForComparison(sim));

  // Prepare data for comparative charts
  // Extract yearly predictions from each simulation
  const prepareChartData = (dataKey, label, unit = '') => {
    return simulations.map((sim, index) => {
      const { inputs, yearlyPredictions } = sim;
      const country = inputs?.country || 'Unknown';
      const policyType = inputs?.policyType === 'CARBON_TAX' ? 'Carbon Tax' : 'ETS';
      
      // Extract yearly data from yearlyPredictions if available
      const yearlyData = yearlyPredictions ? yearlyPredictions.map(yp => ({
        year: yp.year,
        [dataKey]: yp[dataKey] !== null && yp[dataKey] !== undefined ? yp[dataKey] : null
      })) : null;
      
      return {
        label: `${country} - ${policyType}`,
        country,
        policyType,
        yearlyData: yearlyData && yearlyData.length > 0 ? yearlyData : null
      };
    }).filter(sim => sim.yearlyData !== null); // Only include simulations with data
  };

  // GDP Impact data (from gdp_impact in yearly predictions)
  const gdpImpactData = prepareChartData('gdp_impact', 'GDP Impact', '%');
  
  // CO2 Emissions data (from co2_reduction_percent in yearly predictions - stored as million tons)
  const co2EmissionsData = prepareChartData('co2_reduction_percent', 'CO₂ Covered', 'M tons');
  
  // Employment Impact - not available in current backend, will be empty
  const employmentImpactData = prepareChartData('employment_impact', 'Employment Impact', '%');
  
  // Cost of Living - not available in current backend, will be empty
  const costOfLivingData = prepareChartData('cost_of_living_change', 'Cost of Living Change', '%');

  return (
    <div className="compare-graphs-container">
      <div className="compare-graphs-header">
        <h2 className="compare-graphs-title">Comparative Analysis ({simulations.length} policies)</h2>
        <div className="compare-graphs-actions">
          <div className="export-btn-wrapper" ref={exportMenuRef}>
            <button 
              className="export-btn" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Download Options"
            >
              Download ▼
            </button>
            {showExportMenu && (
              <ExportMenu 
                data={formattedSimulations} 
                onClose={() => setShowExportMenu(false)}
              />
            )}
          </div>
          {onBack && (
            <button 
              className="back-to-compare-btn"
              onClick={onBack}
            >
              Back to Table
            </button>
          )}
        </div>
      </div>

      {/* Compact Comparison Table */}
      <div className="compare-chart-group" style={{ marginBottom: '40px' }}>
        <ComparisonTable simulations={simulations} />
      </div>

      {/* GDP Impact Comparison */}
      {gdpImpactData.length > 0 && (
        <div className="compare-chart-group">
          <ComparativeChart
            title="GDP Impact Comparison"
            data={gdpImpactData}
            yAxisLabel="GDP Impact (%)"
            dataKey="gdp_impact"
            unit="%"
            noDataMessage="GDP impact data not available for comparison"
          />
        </div>
      )}

      {/* CO2 Emissions Comparison */}
      {co2EmissionsData.length > 0 && (
        <div className="compare-chart-group">
          <ComparativeChart
            title="CO₂ Covered Comparison (Time Series)"
            data={co2EmissionsData}
            yAxisLabel="CO₂ Covered (M tons)"
            dataKey="co2_reduction_percent"
            unit="M tons"
            noDataMessage="CO₂ emissions data not available for comparison"
          />
        </div>
      )}

      {/* Employment Impact Comparison - Only show if data available */}
      {employmentImpactData.length > 0 && (
        <div className="compare-chart-group">
          <ComparativeChart
            title="Employment Impact Comparison"
            data={employmentImpactData}
            yAxisLabel="Employment Impact (%)"
            dataKey="employment_impact"
            unit="%"
            noDataMessage="Employment impact data not available for comparison"
          />
        </div>
      )}

      {/* Cost of Living Comparison - Only show if data available */}
      {costOfLivingData.length > 0 && (
        <div className="compare-chart-group">
          <ComparativeChart
            title="Cost of Living Change Comparison"
            data={costOfLivingData}
            yAxisLabel="Cost of Living Change (%)"
            dataKey="cost_of_living_change"
            unit="%"
            noDataMessage="Cost of living data not available for comparison"
          />
        </div>
      )}
    </div>
  );
}

export default CompareGraphs;
