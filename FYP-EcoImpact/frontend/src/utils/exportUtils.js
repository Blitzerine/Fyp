/**
 * Utility functions for exporting comparison data
 */

/**
 * Format date for filename
 * @returns {string} - Formatted date string
 */
const getFormattedDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Format number with specified decimals
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number
 */
const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return Number(num).toFixed(decimals);
};

/**
 * Export data as CSV
 * @param {Array} data - Array of comparison data objects
 */
export const exportToCSV = (data) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = [
    'Country',
    'Policy Type',
    'Carbon Price (USD/ton CO₂)',
    'Duration (Years)',
    'Annual Revenue (Million USD)',
    'Policy Success (%)',
    'Risk Level',
    'CO₂ Covered (Million tons/year)',
    'Revenue as % of GDP'
  ];

  const rows = data.map(item => [
    item.country || '',
    item.policyType || '',
    formatNumber(item.carbonPrice, 2),
    item.duration || 0,
    formatNumber(item.annualRevenue, 2),
    item.successProbability !== null && item.successProbability !== undefined 
      ? formatNumber(item.successProbability * 100, 1) 
      : 'N/A',
    item.status || 'N/A',
    item.co2Covered !== null ? formatNumber(item.co2Covered, 2) : 'N/A',
    item.revenuePctGDP !== null ? formatNumber(item.revenuePctGDP, 2) : 'N/A'
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Add BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `ecoimpact_policy_comparison_${getFormattedDate()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data as Excel (.xlsx)
 * Note: This uses a simple CSV approach with .xlsx extension
 * For true Excel support, you would need to install xlsx library
 * @param {Array} data - Array of comparison data objects
 */
export const exportToExcel = async (data) => {
  // For now, we'll use CSV format with .xlsx extension
  // This will open in Excel but won't have true Excel formatting
  // To add true Excel support, install: npm install xlsx
  // and use the XLSX library to create proper .xlsx files
  
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Use CSV format but with .xlsx extension
  // Excel will open it correctly
  exportToCSV(data);
  
  // For future: Implement true Excel export using xlsx library
  // Uncomment and install xlsx package if needed:
  /*
  const XLSX = require('xlsx');
  const headers = [
    'Country', 'Policy Type', 'Carbon Price (USD/ton CO₂)', 'Duration (Years)',
    'Emission Coverage (%)', 'Annual Revenue (Million USD)', 
    'CO₂ Covered (Million tons/year)', 'Revenue as % of GDP', 
    'Fossil Fuel Dependency (%)'
  ];
  const worksheetData = [
    headers,
    ...data.map(item => [
      item.country || '',
      item.policyType || '',
      item.carbonPrice || 0,
      item.duration || 0,
      item.emissionCoverage || 0,
      item.annualRevenue || 0,
      item.co2Covered !== null ? item.co2Covered : 'N/A',
      item.revenuePctGDP !== null ? item.revenuePctGDP : 'N/A',
      item.fossilFuelDependency !== null ? item.fossilFuelDependency : 'N/A'
    ])
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Policy Comparison');
  XLSX.writeFile(workbook, `ecoimpact_policy_comparison_${getFormattedDate()}.xlsx`);
  */
};

/**
 * Export data as JSON
 * @param {Array} data - Array of comparison data objects
 */
export const exportToJSON = (data) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `ecoimpact_policy_comparison_${getFormattedDate()}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data as PDF
 * @param {Array} data - Array of comparison data objects
 */
export const exportToPDF = (data) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create a simple HTML table for PDF
  const headers = [
    'Country',
    'Policy Type',
    'Carbon Price<br/>(USD/ton CO₂)',
    'Duration<br/>(Years)',
    'Annual Revenue<br/>(Million USD)',
    'Policy Success (%)',
    'Risk Level',
    'CO₂ Covered<br/>(Million tons/year)',
    'Revenue as<br/>% of GDP'
  ];

  let tableRows = '';
  data.forEach(item => {
    tableRows += '<tr>';
    tableRows += `<td>${item.country || ''}</td>`;
    tableRows += `<td>${item.policyType || ''}</td>`;
    tableRows += `<td>${formatNumber(item.carbonPrice, 2)}</td>`;
    tableRows += `<td>${item.duration || 0}</td>`;
    tableRows += `<td>${formatNumber(item.annualRevenue, 2)}</td>`;
    tableRows += `<td>${item.successProbability !== null && item.successProbability !== undefined ? formatNumber(item.successProbability * 100, 1) : 'N/A'}</td>`;
    tableRows += `<td>${item.status || 'N/A'}</td>`;
    tableRows += `<td>${item.co2Covered !== null ? formatNumber(item.co2Covered, 2) : 'N/A'}</td>`;
    tableRows += `<td>${item.revenuePctGDP !== null ? formatNumber(item.revenuePctGDP, 2) : 'N/A'}</td>`;
    tableRows += '</tr>';
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Eco-Impact Policy Comparison</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #000;
          }
          h1 {
            color: #00FF6F;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
            font-size: 10px;
          }
          th {
            background-color: #0A0D0B;
            color: #00FF6F;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Eco-Impact AI Policy Comparison</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print dialog
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Optionally close after printing
      // printWindow.close();
    }, 250);
  };
};

