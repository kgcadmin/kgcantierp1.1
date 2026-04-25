import React, { useContext, useState } from 'react';
import { Shield, Bell, Settings as SettingsIcon, Save, Upload, Image as ImageIcon, Layout, Plus, Trash2, ChevronRight } from 'lucide-react';

import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';

const SystemManagement = () => {
  const { systemConfig, setSystemConfig, systemHealth, profileTemplate, setProfileTemplate } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('settings');
  const [config, setConfig] = useState(systemConfig);
  const [editingTemplate, setEditingTemplate] = useState(profileTemplate);


  const handleSave = () => {
    setSystemConfig(config);
    setProfileTemplate(editingTemplate);
    // Update favicon if changed
    if (config.collegeFavicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = config.collegeFavicon;
    }
    alert('System settings and templates updated successfully!');
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, [type]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>System Management</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Implement tasks, configurations, roles & permissions.</p>
        </div>
        <button 
          onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}
        >
          <Save size={18} /> Save Settings
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        {['Settings', 'Branding', 'Forms', 'Roles', 'Notifications', 'Schedulers', 'Health'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab.toLowerCase())}
            style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === tab.toLowerCase() ? '2px solid var(--primary)' : 'none', color: activeTab === tab.toLowerCase() ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === tab.toLowerCase() ? 600 : 500, cursor: 'pointer' }}
          >
            {tab}
          </button>
        ))}
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {activeTab === 'settings' && (
          <Card style={{ padding: '1.5rem' }}>

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            <SettingsIcon size={20} /> General Configuration
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Timezone</label>
              <select 
                value={config.timezone}
                onChange={e => setConfig({...config, timezone: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
              >
                <option value="UTC+00:00">UTC+00:00</option>
                <option value="UTC+05:30">UTC+05:30 (IST)</option>
                <option value="UTC-05:00">UTC-05:00 (EST)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Currency Format</label>
              <input 
                type="text" 
                value={config.currency}
                onChange={e => setConfig({...config, currency: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>
          </Card>
        )}

        {activeTab === 'branding' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', gridColumn: 'span 2' }}>
            <Card style={{ padding: '1.5rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                <ImageIcon size={20} /> Institutional Identity
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>College Full Name</label>
                  <input 
                    type="text" 
                    value={config.collegeName}
                    onChange={e => setConfig({...config, collegeName: e.target.value})}
                    placeholder="e.g. Kashibai Ganpat College"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Short Name / Abbreviation</label>
                  <input 
                    type="text" 
                    value={config.collegeShortName}
                    onChange={e => setConfig({...config, collegeShortName: e.target.value})}
                    placeholder="e.g. KGC"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>
            </Card>

            <Card style={{ padding: '1.5rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                <Upload size={20} /> Assets (Logo & Favicon)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>College Logo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', border: '1px dashed var(--border-color)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg-surface)' }}>
                      {config.collegeLogo ? <img src={config.collegeLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={24} style={{ opacity: 0.3 }} />}
                    </div>
                    <label style={{ cursor: 'pointer', padding: '0.5rem 1rem', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      Change Logo
                      <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'collegeLogo')} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Favicon (.ico, .svg, .png)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', border: '1px dashed var(--border-color)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg-surface)' }}>
                      {config.collegeFavicon ? <img src={config.collegeFavicon} alt="Favicon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={16} style={{ opacity: 0.3 }} />}
                    </div>
                    <label style={{ cursor: 'pointer', padding: '0.5rem 1rem', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      Change Favicon
                      <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'collegeFavicon')} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
        {activeTab === 'forms' && (
          <div style={{ gridColumn: 'span 2' }}>
            <Card style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
                    <Layout size={20} /> Personal Information Form Builder
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Customize the fields available in student/staff profile forms.</p>
                </div>
                <button 
                  onClick={() => {
                    const sectionId = window.prompt("New Section Name (e.g. Identity Docs):");
                    if (sectionId) {
                      setEditingTemplate({
                        ...editingTemplate,
                        sections: [...editingTemplate.sections, { id: sectionId.toLowerCase().replace(/\s+/g, '_'), title: sectionId, fields: [] }]
                      });
                    }
                  }}
                  className={styles.btn} 
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-light)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={16} /> Add Section
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {editingTemplate.sections.map((section, sIdx) => (
                  <div key={section.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 600 }}>{section.title}</h3>
                      <button 
                        onClick={() => {
                          const label = window.prompt("Field Label (e.g. Passport Number):");
                          if (!label) return;
                          const type = window.prompt("Field Type (text, date, select, checkbox):", "text");
                          const newField = { id: label.toLowerCase().replace(/\s+/g, '_'), label, type: type || 'text' };
                          
                          const newSections = [...editingTemplate.sections];
                          newSections[sIdx].fields.push(newField);
                          setEditingTemplate({ ...editingTemplate, sections: newSections });
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.8125rem' }}
                      >
                        <Plus size={14} /> Add Field
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                      {section.fields.map((field, fIdx) => (
                        <div key={field.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-surface)', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <ChevronRight size={14} color="var(--text-tertiary)" />
                            <div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{field.label}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Type: {field.type}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Remove field "${field.label}"?`)) {
                                const newSections = [...editingTemplate.sections];
                                newSections[sIdx].fields.splice(fIdx, 1);
                                setEditingTemplate({ ...editingTemplate, sections: newSections });
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {section.fields.length === 0 && (
                        <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '1rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                          No fields in this section yet.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'roles' && (
          <Card style={{ padding: '1.5rem' }}>

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            <Shield size={20} /> Security & Roles
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Max Login Attempts</label>
              <input 
                type="number" 
                value={config.loginAttempts}
                onChange={e => setConfig({...config, loginAttempts: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={config.maintenanceMode}
                onChange={e => setConfig({...config, maintenanceMode: e.target.checked})}
                id="maint"
              />
              <label htmlFor="maint" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Enable Maintenance Mode</label>
            </div>
          </div>
          </Card>
        )}


        {activeTab === 'notifications' && (
          <Card style={{ padding: '1.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              <Bell size={20} /> Notification Settings
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={config.emailNotifications}
                  onChange={e => setConfig({...config, emailNotifications: e.target.checked})}
                  id="emailNotif"
                />
                <label htmlFor="emailNotif" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Enable Email Notifications (Fees, Exams, Leaves)</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={config.smsNotifications}
                  onChange={e => setConfig({...config, smsNotifications: e.target.checked})}
                  id="smsNotif"
                />
                <label htmlFor="smsNotif" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Enable SMS Notifications (Absences, Emergency Alerts)</label>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'health' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             <Card style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Scheduler Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{systemHealth.schedulerSummary.active}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Tasks</div>
                   </div>
                   <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{systemHealth.schedulerSummary.running}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Running Now</div>
                   </div>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                   <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Last Backup: <strong>{systemHealth.lastBackup}</strong></div>
                   <div style={{ fontSize: '0.875rem' }}>System Status: <span style={{ color: '#2e7d32', fontWeight: 600 }}>{systemHealth.status}</span></div>
                </div>
             </Card>

             <Card style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Execution Statistics</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                   <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: '98%', background: '#4caf50' }}></div>
                      <div style={{ width: '2%', background: '#f44336' }}></div>
                   </div>
                   <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>99.5% Success</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                   <div>Total Executions: {systemHealth.executions.total}</div>
                   <div>Failed: {systemHealth.executions.failed}</div>
                </div>
             </Card>

             <Card style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>System Errors & Logs</h3>
                <div className="table-responsive">
                   <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                         <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <th style={{ padding: '0.5rem' }}>Time</th>
                            <th style={{ padding: '0.5rem' }}>Type</th>
                            <th style={{ padding: '0.5rem' }}>Message</th>
                         </tr>
                      </thead>
                      <tbody>
                         {systemHealth.errors.map(err => (
                            <tr key={err.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                               <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem' }}>{err.time}</td>
                               <td style={{ padding: '0.75rem 0.5rem' }}><span style={{ color: '#d32f2f', fontWeight: 600 }}>{err.type}</span></td>
                               <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{err.message}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default SystemManagement;
