import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import cyberEarthImage from '../images/cyberearth.png';

function CompareResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { policyOne, policyTwo } = location.state || {};

  return (
    <div className="page-container results-page">
      <div className="page-background">
        <div className="cyber-earth-container">
          <img src={cyberEarthImage} alt="Cyber Earth" className="cyber-earth" />
        </div>
      </div>
      <div className="page-content-wrapper">
        <div className="page-content">
          <h2 className="page-title">Comparison Results</h2>
          <p className="page-description">Your comparison results will be displayed here.</p>
          <button className="generate-btn" onClick={() => navigate('/compare')}>Back to Compare</button>
        </div>
      </div>
    </div>
  );
}

export default CompareResults;

