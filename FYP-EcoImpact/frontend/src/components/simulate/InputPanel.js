import React from 'react';
import SearchableCountrySelect from '../SearchableCountrySelect';

function InputPanel({ inputs, onInputChange, onSubmit, loading, errors }) {
  const durationOptions = [1, 3, 5, 7, 10];

  const handleChange = (e) => {
    onInputChange(e);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="input-panel">
      <h2 className="panel-title">Set Input Parameters</h2>
      <form className="parameters-form" onSubmit={handleSubmit}>
        <div className="input-cards">
          <div className="input-card">
            <label className="input-label">Country</label>
            <SearchableCountrySelect
              name="country"
              value={inputs.country}
              onChange={handleChange}
              className="parameter-input"
              placeholder="Select Country"
            />
            {errors.country && <span className="error-message">{errors.country}</span>}
          </div>

          <div className="input-card">
            <label className="input-label">Policy Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="policyType"
                  value="CARBON_TAX"
                  checked={inputs.policyType === 'CARBON_TAX'}
                  onChange={handleChange}
                />
                <span>Carbon Tax</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="policyType"
                  value="ETS"
                  checked={inputs.policyType === 'ETS'}
                  onChange={handleChange}
                />
                <span>Emissions Trading System (ETS)</span>
              </label>
            </div>
          </div>

          <div className="input-card">
            <label className="input-label">Carbon Price Rate</label>
            <div className="carbon-price-input-wrapper">
              <input
                type="number"
                name="carbonPriceUSD"
                className="parameter-input"
                placeholder="Enter rate"
                value={inputs.carbonPriceUSD || ''}
                onChange={handleChange}
                step="0.1"
                min="0"
                disabled={loading}
              />
              <span className="carbon-price-unit">USD/tonCO₂</span>
            </div>
            {errors.carbonPriceUSD && <span className="error-message">{errors.carbonPriceUSD}</span>}
          </div>

          <div className="input-card">
            <label className="input-label">Duration</label>
            <select
              name="durationYears"
              className="parameter-input"
              value={inputs.durationYears}
              onChange={handleChange}
              disabled={loading}
            >
              {durationOptions.map(years => (
                <option key={years} value={years}>
                  {years} {years === 1 ? 'Year' : 'Years'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="generate-btn"
          disabled={loading}
        >
          {loading ? 'Simulating...' : 'Simulate'}
        </button>
      </form>
    </div>
  );
}

export default InputPanel;



