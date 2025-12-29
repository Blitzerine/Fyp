import React from 'react';
import { formatSimulationForComparison } from '../../utils/simulationStorage';

/**
 * Compact comparison table showing selected simulations side-by-side
 */
function ComparisonTable({ simulations }) {
  const formattedSimulations = simulations.map(sim => formatSimulationForComparison(sim));

  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return Number(num).toFixed(decimals);
  };

  return (
    <div className="comparison-table-compact">
      <h3 className="comparison-table-compact-title">Policy Comparison Summary</h3>
      <div className="comparison-table-compact-wrapper">
        <table className="comparison-table-compact-table">
          <thead>
            <tr>
              <th>Metric</th>
              {formattedSimulations.map((sim, index) => (
                <th key={sim.id || index}>
                  {sim.country || 'Unknown'}
                  <div className="comparison-table-compact-subtitle">
                    {sim.policyType} - ${formatNumber(sim.carbonPrice, 2)}/ton
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Country</td>
              {formattedSimulations.map((sim, index) => (
                <td key={sim.id || index}>{sim.country || '-'}</td>
              ))}
            </tr>
            <tr>
              <td>Policy Type</td>
              {formattedSimulations.map((sim, index) => (
                <td key={sim.id || index}>{sim.policyType || '-'}</td>
              ))}
            </tr>
            <tr>
              <td>Carbon Price (USD/ton CO₂)</td>
              {formattedSimulations.map((sim, index) => (
                <td key={sim.id || index}>{formatNumber(sim.carbonPrice, 2)}</td>
              ))}
            </tr>
            <tr>
              <td>Duration (Years)</td>
              {formattedSimulations.map((sim, index) => (
                <td key={sim.id || index}>{sim.duration || 0}</td>
              ))}
            </tr>
            <tr>
              <td>Annual Revenue (Million USD)</td>
              {formattedSimulations.map((sim, index) => (
                <td key={sim.id || index}>{formatNumber(sim.annualRevenue, 2)}</td>
              ))}
            </tr>
            <tr>
              <td>Policy Success (% / Risk)</td>
              {formattedSimulations.map((sim, index) => (
                <td key={sim.id || index}>
                  {sim.successProbability !== null && sim.successProbability !== undefined
                    ? `${formatNumber(sim.successProbability * 100, 1)}% (${sim.status || 'N/A'})`
                    : 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td>CO₂ Covered (Million tons/year)</td>
              {formattedSimulations.map((sim, index) => (
                <td key={sim.id || index}>{sim.co2Covered !== null ? formatNumber(sim.co2Covered, 2) : 'N/A'}</td>
              ))}
            </tr>
            <tr>
              <td>Revenue as % of GDP</td>
              {formattedSimulations.map((sim, index) => (
                <td key={sim.id || index}>{sim.revenuePctGDP !== null ? formatNumber(sim.revenuePctGDP, 2) : 'N/A'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComparisonTable;

