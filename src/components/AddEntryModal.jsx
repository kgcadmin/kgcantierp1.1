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
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        overflowY: 'auto', // Overlay scrolls if needed
        zIndex: 10000,
        padding: '0 1rem'
      }}
      onClick={onClose}
    >
      {/* Layer 2: Wrapper controls height and spacing (my-8 equivalent) */}
      <div 
        style={{
          width: '100%',
          maxWidth: '550px',
          marginTop: '4rem',   
          marginBottom: '4rem',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Layer 3: Modal Box handles internal scroll */}
        <div 
          className="page-animate"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: '24px',
            maxHeight: '85vh',      
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--border-light)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'       
          }}
        >
          {/* Header */}
          <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 600 }}>{title}</h2>
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
              <X size={20} />
            </button>
          </div>

          {/* Form Content (Scrollable) */}
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
                  Loading form components...
                </div>
              )}
            </form>
          </div>

          {/* Sticky Footer Actions */}
          <div style={{ padding: '1.5rem 2rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-main)',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              form="modal-form" // Link to the form above
              style={{
                flex: 2,
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'var(--primary)',
                color: '#ffffff',
                fontWeight: 600,
                boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)'
              }}
            >
              Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;
