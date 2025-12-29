import React, { useState, useMemo } from 'react';
import { formatSimulationForComparison } from '../../utils/simulationStorage';
import ExportMenu from './ExportMenu';

function CompareTable({ simulations, selectedSimulationIds = [], onCheckboxChange, onRemove, onClearAll }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortColumn, setSortColumn] = useState('policyId'); // Default sort by Policy ID
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  
  // Get selected simulations for export
  const selectedSimulations = simulations.filter(sim => selectedSimulationIds.includes(sim.id));

  // Format simulations, remove duplicates, and assign Policy IDs based on registration order (timestamp)
  // NOTE: Must be called before early return to satisfy React Hooks rules
  const formattedSimulations = useMemo(() => {
    if (!simulations || simulations.length === 0) {
      return [];
    }
    // First, sort by timestamp to determine registration order
    const sortedByTime = [...simulations].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeA - timeB; // Oldest first
    });

    // Remove duplicates based on country, policyType, carbonPrice, and duration
    // Keep the first occurrence (oldest) when duplicates are found
    const seen = new Map();
    const uniqueSimulations = [];

    sortedByTime.forEach((sim) => {
      const formatted = formatSimulationForComparison(sim);
      const key = `${formatted.country || ''}|${formatted.policyType || ''}|${formatted.carbonPrice || ''}|${formatted.duration || ''}`;
      
      if (!seen.has(key)) {
        seen.set(key, true);
        uniqueSimulations.push(sim);
      }
    });

    // Format and assign Policy IDs (1, 2, 3, ...)
    return uniqueSimulations.map((sim, index) => {
      const formatted = formatSimulationForComparison(sim);
      return {
        ...formatted,
        policyId: index + 1, // Policy ID starts from 1
        originalTimestamp: sim.timestamp
      };
    });
  }, [simulations]);

  // Sort formatted simulations based on selected column and direction
  // NOTE: Must be called before early return to satisfy React Hooks rules
  const sortedSimulations = useMemo(() => {
    if (!sortColumn) return formattedSimulations;

    const sorted = [...formattedSimulations].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1; // null values go to end
      if (bVal == null) return -1;

      // String comparison (for country, policyType, status)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Number comparison (for numeric columns)
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Fallback to string comparison
      const aStr = String(aVal);
      const bStr = String(bVal);
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [formattedSimulations, sortColumn, sortDirection]);

  // Handle column header click for sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column header
  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return ''; // No icon when not sorted
    }
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Helper function to compare floating point numbers with tolerance
  const isEqual = (a, b, tolerance = 0.001) => {
    if (a == null || b == null || isNaN(a) || isNaN(b)) return false;
    return Math.abs(a - b) < tolerance;
  };

  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return Number(num).toFixed(decimals);
  };

  // Early return after all hooks have been called
  if (!simulations || simulations.length === 0 || formattedSimulations.length === 0) {
    return (
      <div className="compare-table-empty">
        <p>No simulations to compare yet.</p>
        <p>Run simulations on the Simulate page to see them here.</p>
      </div>
    );
  }

  return (
    <div className="compare-table-container">
      <div className="compare-table-header">
        <h2 className="compare-table-title">Policy Comparison</h2>
        <div className="compare-table-actions">
          <div className="export-btn-wrapper">
            <button 
              className="export-btn" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Download Options"
            >
              Download ▼
            </button>
            {showExportMenu && (
              <ExportMenu 
                data={selectedSimulationIds.length > 0 
                  ? sortedSimulations.filter(sim => selectedSimulationIds.includes(sim.id))
                  : sortedSimulations
                } 
                onClose={() => setShowExportMenu(false)}
              />
            )}
          </div>
          <button 
            className="clear-all-btn" 
            onClick={onClearAll}
            disabled={simulations.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th></th>
              <th 
                className="sortable-header" 
                onClick={() => handleSort('policyId')}
                title="Click to sort by Policy ID"
              >
                Policy ID {getSortIcon('policyId')}
              </th>
              <th 
                className="sortable-header" 
                onClick={() => handleSort('country')}
                title="Click to sort by Country"
              >
                Country {getSortIcon('country')}
              </th>
              <th 
                className="sortable-header" 
                onClick={() => handleSort('policyType')}
                title="Click to sort by Policy Type"
              >
                Policy Type {getSortIcon('policyType')}
              </th>
              <th 
                className="sortable-header" 
                onClick={() => handleSort('carbonPrice')}
                title="Click to sort by Carbon Price"
              >
                Carbon Price<br/>(USD/ton CO₂) {getSortIcon('carbonPrice')}
              </th>
              <th 
                className="sortable-header" 
                onClick={() => handleSort('duration')}
                title="Click to sort by Duration"
              >
                Duration<br/>(Years) {getSortIcon('duration')}
              </th>
              <th 
                className="sortable-header" 
                onClick={() => handleSort('annualRevenue')}
                title="Click to sort by Annual Revenue"
              >
                Annual Revenue<br/>(Million USD) {getSortIcon('annualRevenue')}
              </th>
              <th 
                className="sortable-header" 
                onClick={() => handleSort('successProbability')}
                title="Click to sort by Policy Success"
              >
                Policy Success<br/>(% / Risk) {getSortIcon('successProbability')}
              </th>
              <th 
                className="sortable-header" 
                onClick={() => handleSort('co2Covered')}
                title="Click to sort by CO₂ Covered"
              >
                CO₂ Covered<br/>(Million tons/year) {getSortIcon('co2Covered')}
              </th>
              <th 
                className="sortable-header" 
                onClick={() => handleSort('revenuePctGDP')}
                title="Click to sort by Revenue as % of GDP"
              >
                Revenue as %<br/>of GDP {getSortIcon('revenuePctGDP')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSimulations.map((sim, index) => {
              const isSelected = selectedSimulationIds.includes(sim.id);
              return (
              <tr 
                key={sim.id || index} 
                className={isSelected ? 'compare-table-row-selected' : ''}
                onClick={() => onCheckboxChange(sim.id, !isSelected)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onCheckboxChange(sim.id, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td>{sim.policyId || '-'}</td>
                <td>{sim.country || '-'}</td>
                <td>{sim.policyType || '-'}</td>
                <td>{formatNumber(sim.carbonPrice, 2)}</td>
                <td>{sim.duration || 0}</td>
                <td>
                  {formatNumber(sim.annualRevenue, 2)}
                </td>
                <td>
                  {sim.successProbability !== null && sim.successProbability !== undefined
                    ? `${formatNumber(sim.successProbability * 100, 1)}% (${sim.status || 'N/A'})`
                    : 'N/A'}
                </td>
                <td>
                  {sim.co2Covered !== null ? formatNumber(sim.co2Covered, 2) : 'N/A'}
                </td>
                <td>
                  {sim.revenuePctGDP !== null ? formatNumber(sim.revenuePctGDP, 2) : 'N/A'}
                </td>
                <td>
                  <button 
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(sim.id);
                    }}
                    title="Remove this simulation"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompareTable;
