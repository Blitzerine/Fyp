import React from 'react';

function SimilarPoliciesPanel({ similarPolicies }) {
  if (!similarPolicies || similarPolicies.length === 0) {
    return null;
  }

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(num * 1000000);
  };

  return (
    <div className="similar-policies-panel">
      <h3 className="panel-title">Similar Policies / Regional Context</h3>
      <div className="similar-policies-table">
        <table>
          <thead>
            <tr>
              <th>Policy Name</th>
              <th>Country</th>
              <th>Region</th>
              <th>Coverage</th>
              <th>Revenue</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {similarPolicies.map((policy, index) => (
              <tr key={index}>
                <td>{policy.name}</td>
                <td>{policy.country}</td>
                <td>{policy.region}</td>
                <td>{policy.actualCoveragePct.toFixed(1)}%</td>
                <td>{formatCurrency(policy.actualRevenueMillionUSD)}</td>
                <td>${policy.actualPriceUSD}/ton</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SimilarPoliciesPanel;



