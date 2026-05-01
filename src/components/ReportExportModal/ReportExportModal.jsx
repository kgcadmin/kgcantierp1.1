import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileText } from 'lucide-react';

const ReportExportModal = ({ isOpen, onClose, title, data, columns, filters }) => {
  const [activeFilters, setActiveFilters] = useState(
    filters.reduce((acc, filter) => ({ ...acc, [filter.key]: '' }), {})
  );

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true; // Ignore empty filters
        
        // Handle nested properties or direct values
        const itemValue = item[key];
        if (itemValue === undefined || itemValue === null) return false;
        
        return String(itemValue).toLowerCase() === String(value).toLowerCase();
      });
    });
  }, [data, activeFilters]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return alert("No data to export.");
    
    const headers = columns.map(col => col.label);
    const csvRows = [headers.join(",")];
    
    filteredData.forEach(row => {
      const values = columns.map(col => {
        let val = row[col.key];
        
        // Handle potential arrays or objects simply
        if (Array.isArray(val)) val = val.join('; ');
        else if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        else if (val === null || val === undefined) val = '';
        
        // Escape quotes and wrap in quotes for CSV
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      });
      csvRows.push(values.join(","));
    });
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '1rem', width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={24} /> {title} Reports
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Filter and generate customized data.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <Download size={16} /> Export CSV
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
          </div>
        </div>

        {filters && filters.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(filters.length, 4)}, 1fr)`, gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
            {filters.map(filter => (
              <div key={filter.key}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{filter.label}</label>
                <select 
                  value={activeFilters[filter.key]} 
                  onChange={(e) => setActiveFilters({...activeFilters, [filter.key]: e.target.value})} 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                >
                  <option value="">All {filter.label}s</option>
                  {filter.options.map((opt, idx) => (
                    <option key={idx} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1 }}>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                {columns.map(col => (
                  <th key={col.key} style={{ padding: '0.75rem' }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  {columns.map(col => {
                    let val = row[col.key];
                    if (Array.isArray(val)) val = val.join(', ');
                    if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                    return (
                      <td key={col.key} style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No data matches the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredData.length > 0 && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Showing {filteredData.length} records</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ReportExportModal;
