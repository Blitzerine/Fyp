import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import cyberEarthImage from '../images/cyberearth.png';

function SimulateResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state?.data || {};

  return (
    <div className="page-container results-page">
      <div className="page-background">
        <div className="cyber-earth-container">
          <img src={cyberEarthImage} alt="Cyber Earth" className="cyber-earth" />
        </div>
      </div>
      <div className="page-content-wrapper">
        <div className="page-content">
          <h2 className="page-title">Simulation Results</h2>
          <p className="page-description">Your simulation results will be displayed here.</p>
          <button className="generate-btn" onClick={() => navigate('/simulate')}>Back to Simulate</button>
        </div>
      </div>
    </div>
  );
}

export default SimulateResults;

