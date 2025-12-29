import React, { useState, useRef, useEffect } from 'react';
import { exportToCSV, exportToJSON, exportToPDF } from '../../utils/exportUtils';

function ExportMenu({ data, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleExport = (format) => {
    switch (format) {
      case 'csv':
        exportToCSV(data);
        break;
      case 'json':
        exportToJSON(data);
        break;
      case 'pdf':
        exportToPDF(data);
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <div className="export-menu" ref={menuRef}>
      <button 
        className="export-menu-item"
        onClick={() => handleExport('csv')}
      >
        Download CSV
      </button>
      <button 
        className="export-menu-item"
        onClick={() => handleExport('json')}
      >
        Download JSON
      </button>
      <button 
        className="export-menu-item"
        onClick={() => handleExport('pdf')}
      >
        Download PDF
      </button>
    </div>
  );
}

export default ExportMenu;


