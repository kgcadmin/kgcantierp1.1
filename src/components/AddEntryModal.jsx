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
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',    // Vertical center
        justifyContent: 'center', // Horizontal center
        zIndex: 10000,
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div 
        className="page-animate"
        style={{
          width: '550px',
          maxWidth: '100%',
          maxHeight: '90vh',        // Fixed max height
          background: 'var(--bg-surface)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',   // Vertical sections
          border: '1px solid var(--border-light)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'         // Contain children
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* SECTION 1: HEADER (Fixed) */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-hover)',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* SECTION 2: BODY (Scrollable) */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit} id="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {fields && fields.length > 0 ? (
              fields.map(field => (
                <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select 
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-light)', color: '#ffffff', padding: '0.75rem', borderRadius: '8px' }}
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
                      rows={3}
                      style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-light)', color: '#ffffff', padding: '0.75rem', borderRadius: '8px', resize: 'vertical' }}
                    />
                  ) : (
                    <input 
                      type={field.type || 'text'}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-light)', color: '#ffffff', padding: '0.75rem', borderRadius: '8px' }}
                    />
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Preparing form data...
              </div>
            )}
          </form>
        </div>

        {/* SECTION 3: FOOTER (Fixed) */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'var(--bg-surface-hover)',
              color: 'var(--text-main)',
              fontWeight: 500
            }}
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="modal-form"
            style={{
              flex: 2,
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)'
            }}
          >
            Save Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;
