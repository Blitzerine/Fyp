import React from 'react';

function LoadingOverlay({ isLoading, message = 'Running simulation...' }) {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-backdrop"></div>
      <div className="loading-overlay-content">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;

