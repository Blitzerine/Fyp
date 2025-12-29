import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cyberEarthImage from '../images/cyberearth.png';
import CompareTable from '../components/compare/CompareTable';
import CompareGraphs from '../components/compare/CompareGraphs';
import { 
  getSimulations, 
  removeSimulation, 
  clearAllSimulations
} from '../utils/simulationStorage';

function Compare() {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState([]);
  const [showCompareGraphs, setShowCompareGraphs] = useState(false);
  const [selectedSimulationIds, setSelectedSimulationIds] = useState([]);

  useEffect(() => {
    // Load simulations from localStorage
    const storedSimulations = getSimulations();
    setSimulations(storedSimulations);
  }, []);

  const handleRemove = (id) => {
    removeSimulation(id);
    const updated = getSimulations();
    setSimulations(updated);
    // Remove from selected if it was selected
    setSelectedSimulationIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all simulations? This action cannot be undone.')) {
      clearAllSimulations();
      setSimulations([]);
      setSelectedSimulationIds([]);
      setShowCompareGraphs(false);
    }
  };

  const handleCompareGraphs = () => {
    // Filter simulations to only include selected ones
    const selectedSimulations = simulations.filter(sim => selectedSimulationIds.includes(sim.id));
    setShowCompareGraphs(true);
  };

  const handleCheckboxChange = (simulationId, checked) => {
    if (checked) {
      // Add to selected
      setSelectedSimulationIds(prev => [...prev, simulationId]);
    } else {
      // Remove from selected
      setSelectedSimulationIds(prev => prev.filter(id => id !== simulationId));
    }
  };

  const handleClearCheckboxes = () => {
    setSelectedSimulationIds([]);
    setShowCompareGraphs(false);
  };

  // Get selected simulations for CompareGraphs
  const selectedSimulations = simulations.filter(sim => selectedSimulationIds.includes(sim.id));

  return (
    <div className="page-container compare-page">
      <div className="page-background">
        <div className="cyber-earth-container">
          <img src={cyberEarthImage} alt="Cyber Earth" className="cyber-earth" />
        </div>
      </div>
      <div className="page-content-wrapper">
        <div className="page-content">
          <h2 className="page-title">Compare Policies</h2>
          <p className="page-description">
            Compare all your simulation results side by side. Run simulations on the Simulate page to see them here.
          </p>
          
          <div className="compare-section">
            {!showCompareGraphs ? (
              <>
                <div className="compare-options">
                  {selectedSimulationIds.length >= 2 ? (
                    <>
                      <button 
                        className="compare-graphs-btn"
                        onClick={handleCompareGraphs}
                      >
                        Compare Selected ({selectedSimulationIds.length})
                      </button>
                      <button 
                        className="clear-checkboxes-btn"
                        onClick={handleClearCheckboxes}
                      >
                        Clear Selection
                      </button>
                    </>
                  ) : selectedSimulationIds.length === 1 ? (
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
                      Please select at least 2 policies to compare
                    </p>
                  ) : null}
                </div>

                <CompareTable
                  simulations={simulations}
                  selectedSimulationIds={selectedSimulationIds}
                  onCheckboxChange={handleCheckboxChange}
                  onRemove={handleRemove}
                  onClearAll={handleClearAll}
                />
              </>
            ) : (
              <CompareGraphs 
                simulations={selectedSimulations}
                onBack={() => setShowCompareGraphs(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Compare;
