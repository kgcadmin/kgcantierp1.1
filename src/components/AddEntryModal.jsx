import React, { useState } from 'react';
import { X } from 'lucide-react';
import Card from './Card/Card';

/**
 * Reusable Modal for adding entries (Students, Faculty, Staff, etc.)
 */
const AddEntryModal = ({ isOpen, onClose, onSave, title, fields }) => {
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({});
    onClose();
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowY: 'auto', // Enable scrolling on the backdrop layer
        background: 'rgba(10, 15, 25, 0.9)', // Solid, dark premium backdrop
        backdropFilter: 'blur(10px)',
        padding: '40px 20px' // Healthy margin from the top of the screen
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '550px',
          maxWidth: '100%',
          background: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '1px solid var(--border-light)',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)',
          padding: '40px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '24px', fontWeight: 700 }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-hover)',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {fields && fields.length > 0 ? (
            fields.map(field => (
              <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select 
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    style={{ 
                      width: '100%', 
                      background: 'var(--bg-base)', 
                      border: '1px solid var(--border-light)', 
                      color: '#ffffff', 
                      padding: '12px 16px', 
                      borderRadius: '10px',
                      fontSize: '15px'
                    }}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea 
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    style={{ 
                      width: '100%', 
                      background: 'var(--bg-base)', 
                      border: '1px solid var(--border-light)', 
                      color: '#ffffff', 
                      padding: '12px 16px', 
                      borderRadius: '10px', 
                      fontSize: '15px',
                      resize: 'vertical' 
                    }}
                  />
                ) : (
                  <input 
                    type={field.type || 'text'}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    style={{ 
                      width: '100%', 
                      background: 'var(--bg-base)', 
                      border: '1px solid var(--border-light)', 
                      color: '#ffffff', 
                      padding: '12px 16px', 
                      borderRadius: '10px',
                      fontSize: '15px'
                    }}
                  />
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading form components...
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-main)',
                fontWeight: 600,
                fontSize: '15px'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                flex: 2,
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)'
              }}
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntryModal;
