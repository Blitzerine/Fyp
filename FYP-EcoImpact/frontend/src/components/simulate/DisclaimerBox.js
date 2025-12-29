import React from 'react';

function DisclaimerBox() {
  return (
    <div className="disclaimer-box">
      <div className="disclaimer-icon">ℹ️</div>
      <div className="disclaimer-content">
        <h4 className="disclaimer-title">Model Limitations</h4>
        <p className="disclaimer-text">
          We predict only emission coverage % and annual revenue based on historical carbon pricing data. 
          CO₂ covered and related metrics are calculated from these predictions and national emissions data. 
          We do <strong>NOT</strong> predict GDP impact, employment changes, or cost-of-living effects.
        </p>
      </div>
    </div>
  );
}

export default DisclaimerBox;



