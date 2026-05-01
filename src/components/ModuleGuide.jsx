import React, { useState, useEffect } from 'react';
import { Info, X, Lightbulb } from 'lucide-react';

const ModuleGuide = ({ role, adminText, staffText, studentText, moduleId }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Optionally remember if user dismissed this specific module's guide
    const dismissed = localStorage.getItem(`guide_dismissed_${moduleId}`);
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, [moduleId]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (moduleId) {
      localStorage.setItem(`guide_dismissed_${moduleId}`, 'true');
    }
  };

  let helpText = '';
  if (role === 'Admin' || role === 'Management') {
    helpText = adminText || staffText || studentText;
  } else if (role === 'Faculty' || role === 'Staff') {
    helpText = staffText || studentText || adminText;
  } else {
    helpText = studentText || staffText || adminText;
  }

  if (!helpText) return null;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: '1rem', 
      background: 'rgba(59, 130, 246, 0.1)', // Light primary bg
      border: '1px solid rgba(59, 130, 246, 0.3)',
      padding: '1rem', 
      borderRadius: '0.75rem', 
      marginBottom: '1.5rem',
      position: 'relative'
    }}>
      <div style={{ color: '#3b82f6', marginTop: '0.1rem' }}>
        <Lightbulb size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '0.875rem' }}>Quick Guide</h4>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.4' }}>
          {helpText}
        </p>
      </div>
      <button 
        onClick={handleDismiss}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-tertiary)', 
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Dismiss Guide"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ModuleGuide;
