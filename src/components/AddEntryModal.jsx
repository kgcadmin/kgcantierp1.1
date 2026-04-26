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
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <Card 
        className="page-animate"
        style={{
          width: '500px',
          maxWidth: '100%',
          padding: '2rem',
          position: 'relative',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>{title}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {fields.map(field => (
            <div key={field.name}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select 
                  required={field.required}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map(opt => (
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
                  style={{ width: '100%' }}
                />
              ) : (
                <input 
                  type={field.type || 'text'}
                  required={field.required}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  style={{ width: '100%' }}
                />
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'var(--bg-surface-hover)',
                color: 'white'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                flex: 2,
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 600
              }}
            >
              Save Entry
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddEntryModal;
