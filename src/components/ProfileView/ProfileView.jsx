import React, { useState, useContext } from 'react';
import { User, Mail, Phone, Building, ShieldCheck, Download, Trash2, Edit2, Save, X, ChevronDown, Calendar, Globe, Award, BookOpen, MapPin, Activity, Plus, FileText, Book, Grid, Layers, Building2 } from 'lucide-react';
import Card from '../Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from './ProfileView.module.css';

const fileStore = new Map();

const ProfileView = ({ data, type, onSave, onDelete, onCancel }) => {
  const { 
    documents, addDocument, deleteDocument, attendance,
    departments, categories, degrees, subjects, 
    setDepartments, setCategories, setDegrees, setSubjects,
    currentUser, profileTemplate, setProfileTemplate 
  } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...data });
  const [activeTab, setActiveTab] = useState('personal');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleAddEntry = () => {
    const type = window.prompt("Enter type (Subject/Department/Category/Degree):");
    if (!type) return;
    
    if (type.toLowerCase() === 'subject') {
      const name = window.prompt("Subject Name:");
      const code = window.prompt("Subject Code:");
      if (name && code) setSubjects([...subjects, { id: Date.now(), name, code, credits: 3, syllabus: 'N/A', books: 'N/A' }]);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleMenuClick = (item) => {
    setShowProfileMenu(false);
    setActiveTab(item.toLowerCase());
  };

  const handleUploadDoc = () => {
    // Trigger hidden file input
    document.getElementById(`profile-doc-upload-${formData.id}`).click();
  };

  const handleDocFileSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const docId = `DOC${Date.now()}`;
    // Store in memory for immediate access
    fileStore.set(docId, file);

    const docMeta = {
      id: docId,
      title: file.name,
      category: 'Profile Attachment',
      type: 'Upload',
      visibility: 'Student-Specific',
      studentId: formData.id,
      dateAdded: new Date().toISOString().split('T')[0],
      size: (file.size / 1024).toFixed(1) + ' KB',
      fileType: file.type,
      hasLocalFile: true
    };

    // Attempt upload to server
    const shouldUpload = import.meta.env.PROD || import.meta.env.VITE_API_URL;
    if (shouldUpload) {
      api.upload(file).then(res => {
        if (res && res.url && !res.error) {
          const relativeUrl = res.url.replace(/^https?:\/\/[^/]+/, '');
          addDocument({
            ...docMeta,
            fileUrl: relativeUrl,
            fileType: res.mimetype || docMeta.fileType
          });
          showToast('Document uploaded and synced!');
        } else {
          throw new Error(res?.message || 'Upload failed');
        }
      }).catch(err => {
        console.error('Profile doc upload failed:', err);
        addDocument(docMeta);
        showToast(`Upload failed: ${err.message}. Saved locally.`);
      });
    } else {
      addDocument({ ...docMeta, fileUrl: URL.createObjectURL(file) });
      showToast('Document saved in session.');
    }
    e.target.value = '';
  };

  const handlePreview = (doc) => {
    // If we have a fileUrl (blob URL), use it
    if (doc.fileUrl) {
      setShowPreview(doc);
    } else {
      showToast('Preview not available for this record');
    }
  };

  const handleDownload = async (doc) => {
    if (!doc.fileUrl) {
      showToast('No file available for download');
      return;
    }

    try {
      const response = await fetch(doc.fileUrl);
      const blob = await response.blob();
      const file = new File([blob], doc.title, { type: doc.fileType });

      if (window.showSaveFilePicker) {
        try {
          const ext = doc.title.split('.').pop();
          const handle = await window.showSaveFilePicker({
            suggestedName: doc.title,
            types: [{ description: 'File', accept: { [doc.fileType || 'application/octet-stream']: [`.${ext}`] } }]
          });
          const writable = await handle.createWritable();
          await writable.write(file);
          await writable.close();
          showToast('File saved successfully!');
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }
      
      // Fallback for non-supported browsers
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Starting download...');
    } catch (err) {
      console.error('Download failed:', err);
      showToast('Download failed');
    }
  };

  const userDocuments = documents?.filter(d => d.studentId === formData?.id) || [];
  const userAttendance = attendance?.filter(a => a.records && a.records[formData?.id]) || [];

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User size={16} /> },
    { id: 'academic', label: 'Academic', icon: <Award size={16} /> },
    { id: 'documents', label: 'Documents', icon: <BookOpen size={16} /> },
    { id: 'attendance', label: 'Attendance', icon: <Activity size={16} /> },
    { id: 'departments', label: 'Departments', icon: <Building2 size={16} /> },
    { id: 'categories', label: 'Categories', icon: <Layers size={16} /> },
    { id: 'degrees', label: 'Degrees', icon: <Grid size={16} /> },
    { id: 'subjects', label: 'Subjects', icon: <Book size={16} /> }
  ];

  const renderField = (label, value, field, sectionId = null) => {
    const sectionKey = sectionId === 'personal' ? 'personalDetails' : sectionId;
    const displayValue = sectionKey ? formData[sectionKey]?.[field] : formData[field];
    
    return (
      <div className={styles.fieldItem}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className={styles.fieldLabel}>{label}</label>
          {isEditing && currentUser?.role === 'Admin' && (
            <button 
              onClick={() => {
                if (window.confirm(`Delete field "${label}" from template?`)) {
                  const newTemplate = { ...profileTemplate };
                  const sectionIdx = newTemplate.sections.findIndex(s => s.id === sectionId);
                  if (sectionIdx > -1) {
                    newTemplate.sections[sectionIdx].fields = newTemplate.sections[sectionIdx].fields.filter(f => f.id !== field);
                    setProfileTemplate(newTemplate);
                    showToast('Field removed from template');
                  }
                }
              }}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
              title="Remove from Template"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        {isEditing ? (
          <input 
            type="text" 
            className={styles.fieldInput}
            value={displayValue || ''}
            onChange={(e) => handleChange(sectionKey, field, e.target.value)}
          />
        ) : (
          <div className={styles.fieldValue}>{displayValue || 'N/A'}</div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.profileContainer}>
      <Card className={styles.sidebar}>
        <div className={styles.photoSection}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              {formData.photo ? <img src={formData.photo} alt={formData.name} /> : formData.name?.charAt(0)}
            </div>
            <label className={styles.cameraBtn} title="Change Photo">
              <Plus size={16} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => handleChange(null, 'photo', reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <h2 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-primary)' }}>{formData.name}</h2>
          <div className={styles.photoActions}>
            <span className={`${styles.actionLink} ${styles.remove}`} onClick={() => handleChange(null, 'photo', null)}>Remove Photo</span>
          </div>
        </div>

        <div className={styles.sidebarInfo}>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>{type} ID</span>
            <span className={styles.infoValue}>{formData.id}</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Roll No / Code</span>
            <span className={styles.infoValue}>{formData.rollNo || 'N/A'}</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>GR Number</span>
            <span className={styles.infoValue}>{formData.grNumber || 'N/A'}</span>
          </div>

          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Personal Email</span>
            <span className={styles.infoValue}>{formData.email}</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>College Email</span>
            <span className={styles.infoValue}>{formData.collegeEmail || 'N/A'}</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Mobile</span>
            <span className={styles.infoValue}>{formData.mobile || 'N/A'}</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Institute</span>
            <span className={styles.infoValue}>{formData.institute || 'N/A'}</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Profile Status</span>
            <div style={{ marginTop: '0.25rem' }}>
              <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                {formData.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
        <button className={`${styles.btn} ${styles.btnFull}`} style={{ marginTop: 'auto' }} onClick={onCancel}>
          <X size={16} /> Close Profile
        </button>
      </Card>


      <div className={styles.mainContent}>
        <div className={styles.headerActions}>
          <div className={styles.actionGroup}>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={onCancel}>
              <X size={16} /> Back
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleExportPDF}>
              <Download size={16} /> PDF
            </button>
            {onDelete && (
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onDelete(formData.id)}>
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
          
          <div className={styles.actionGroup}>
            {isEditing ? (
              <>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
                  <Save size={16} /> Save Changes
                </button>
                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => { setIsEditing(false); setFormData({...data}); }}>
                  <X size={16} /> Cancel
                </button>
              </>
            ) : (
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsEditing(true)}>
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
            
            <div className={styles.profileMenuWrapper}>
              <button 
                className={`${styles.btn} ${styles.btnOutline}`} 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                Profile <ChevronDown size={16} className={showProfileMenu ? styles.rotate : ''} />
              </button>
              {showProfileMenu && (
                <div className={styles.profileDropdown}>
                  {['Subject', 'Document', 'Qualification', 'Timetable', 'Attendance'].map(item => (
                    <div 
                      key={item} 
                      className={styles.dropdownMenuItem} 
                      onClick={() => handleMenuClick(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>


        <div className={styles.profileTabs}>
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`${styles.tabItem} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ marginRight: '0.5rem', display: 'inline-flex', verticalAlign: 'middle' }}>{tab.icon}</span>
              {tab.label}
            </div>
          ))}
        </div>

        <Card style={{ padding: '2rem' }}>
          {activeTab === 'personal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={styles.sectionTitle} style={{ margin: 0 }}><User size={20} /> Personal Information</div>
                {isEditing && currentUser?.role === 'Admin' && (
                  <button 
                    onClick={() => {
                      const title = window.prompt("New Section Title (e.g. Identity Documents):");
                      if (title) {
                        const id = title.toLowerCase().replace(/\s+/g, '_');
                        setProfileTemplate({
                          ...profileTemplate,
                          sections: [...profileTemplate.sections, { id, title, fields: [] }]
                        });
                        showToast('Section added to template');
                      }
                    }}
                    className={styles.btn}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'var(--bg-surface-hover)' }}
                  >
                    <Plus size={14} /> Add Section
                  </button>
                )}
              </div>

              {profileTemplate?.sections?.map((section) => (
                <div key={section.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '1rem', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, margin: 0 }}>{section.title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {isEditing && currentUser?.role === 'Admin' && (
                        <>
                          <button 
                            onClick={() => {
                              const label = window.prompt("Field Label (e.g. Passport Number):");
                              if (label) {
                                const id = label.toLowerCase().replace(/\s+/g, '_');
                                const type = window.prompt("Field Type (text, date, select):", "text");
                                const newTemplate = { ...profileTemplate };
                                const sIdx = newTemplate.sections.findIndex(s => s.id === section.id);
                                newTemplate.sections[sIdx].fields.push({ id, label, type: type || 'text' });
                                setProfileTemplate(newTemplate);
                                showToast('Field added to template');
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Plus size={14} /> Add Field
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Delete entire section "${section.title}"?`)) {
                                setProfileTemplate({
                                  ...profileTemplate,
                                  sections: profileTemplate.sections.filter(s => s.id !== section.id)
                                });
                                showToast('Section removed');
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.gridFields}>
                    {section.id === 'personal' && (
                      <>
                        {renderField('Full Name', formData.name, 'name')}
                        {renderField('Roll No', formData.rollNo, 'rollNo')}
                        {renderField('GR Number', formData.grNumber, 'grNumber')}
                      </>
                    )}
                    {section?.fields?.map(field => renderField(field.label, null, field.id, section.id))}
                    {section.fields.length === 0 && section.id !== 'personal' && (
                      <div style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem' }}>
                        No fields defined for this section. Click 'Add Field' while editing.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'academic' && (
            <>
              <div className={styles.sectionTitle}><Award size={20} /> Academic Information</div>
              <div className={styles.gridFields}>
                {renderField('Department', formData.department, 'department')}
                {renderField('Current Year', formData.year, 'year')}
                {renderField('Current GPA', formData.gpa, 'gpa')}
                {renderField('Profile Verification', formData.profileStatus, 'profileStatus')}
              </div>
            </>
          )}

          {activeTab === 'documents' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className={styles.sectionTitle} style={{ margin: 0, border: 0 }}><BookOpen size={20} /> Personal Documents</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Hidden real file input */}
                  <input
                    type="file"
                    id={`profile-doc-upload-${formData.id}`}
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleDocFileSelected}
                  />
                  <button className={styles.btn} onClick={handleUploadDoc}><Plus size={16} /> Upload New</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {userDocuments.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <FileText size={24} color="var(--text-tertiary)" />
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '0.875rem' }}>{doc.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{doc.category} • {doc.dateAdded}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className={styles.actionBtn} onClick={() => handlePreview(doc)} title="Preview"><FileText size={16} /></button>
                      <button className={styles.actionBtn} onClick={() => handleDownload(doc)} title="Download"><Download size={16} /></button>
                      <button className={styles.actionBtn} style={{ color: '#ef4444' }} onClick={() => { deleteDocument(doc.id); showToast('Document deleted'); }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {userDocuments.length === 0 && (
                  <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px dashed var(--border-color)' }}>
                    <BookOpen size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                    <p style={{ margin: 0, color: 'var(--text-tertiary)' }}>No documents uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <div className={styles.sectionTitle}><Activity size={20} /> Attendance Tracking</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {userAttendance.map(record => (
                  <div key={record.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Calendar size={20} color="var(--text-tertiary)" />
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '0.875rem' }}>{record.date}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Batch: {record.batchId}</span>
                      </div>
                    </div>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: record.records[formData.id] === 'Present' ? '#e8f5e9' : '#ffebee',
                      color: record.records[formData.id] === 'Present' ? '#2e7d32' : '#c62828'
                    }}>
                      {record.records[formData.id]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <Card className={styles.dataCard}>
              <h2 className={styles.sectionTitle}>Departments</h2>
              <table className={styles.table}>
                <thead>
                  <tr><th>ID</th><th>Department Name</th><th>Head of Department</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d.id}>
                      <td>{d.id}</td><td>{d.name}</td><td>{d.head}</td>
                      <td><button className={styles.deleteBtn} onClick={() => setDepartments(departments.filter(item => item.id !== d.id))}><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {activeTab === 'categories' && (
            <Card className={styles.dataCard}>
              <h2 className={styles.sectionTitle}>Course Categories</h2>
              <ul className={styles.list}>
                {categories.map(c => (
                  <li key={c.id} className={styles.listItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span className={styles.idBadge}>{c.id}</span><span>{c.name}</span></div>
                    <button className={styles.deleteBtn} onClick={() => setCategories(categories.filter(item => item.id !== c.id))}><Trash2 size={16} /></button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {activeTab === 'degrees' && (
            <Card className={styles.dataCard}>
              <h2 className={styles.sectionTitle}>Degrees Map</h2>
              <table className={styles.table}>
                <thead>
                  <tr><th>Degree ID</th><th>Name</th><th>Category ID</th><th>Department ID</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {degrees.map(d => (
                    <tr key={d.id}>
                      <td>{d.id}</td><td>{d.name}</td><td>{d.categoryId}</td><td>{d.departmentId}</td>
                      <td><button className={styles.deleteBtn} onClick={() => setDegrees(degrees.filter(item => item.id !== d.id))}><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {activeTab === 'subjects' && (
            <div className={styles.grid}>
              {subjects.map(s => (
                <Card key={s.id} className={styles.subjectCard}>
                  <div className={styles.subjectHeader}>
                    <span className={styles.subjectCode}>{s.code}</span>
                    <button className={styles.deleteBtnSmall} onClick={() => setSubjects(subjects.filter(item => item.id !== s.id))}><Trash2 size={14} /></button>
                  </div>
                  <h3 className={styles.subjectName}>{s.name}</h3>
                </Card>
              ))}
              <Card className={styles.addCard} onClick={handleAddEntry}>
                <Plus size={32} />
                <span>Add New Subject</span>
              </Card>
            </div>
          )}
        </Card>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#1e293b', color: 'white', padding: '1rem 1.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 3000, display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-color)', animation: 'slideUp 0.3s ease-out' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
          {toast}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '2rem' }}>
          <Card style={{ width: '800px', height: '80vh', maxWidth: '95vw', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Preview: {showPreview.title}</h2>
              </div>
              <button onClick={() => setShowPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>
            <div style={{ flex: 1, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', overflow: 'hidden' }}>
              {showPreview.fileUrl ? (
                (() => {
                  const fullUrl = showPreview.fileUrl.startsWith('http') ? showPreview.fileUrl : `${window.location.origin}${showPreview.fileUrl.startsWith('/') ? '' : '/'}${showPreview.fileUrl}`;
                  
                  if (showPreview.fileType?.startsWith('image/')) {
                    return (
                      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        <img src={fullUrl} alt={showPreview.title} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', objectFit: 'contain' }} />
                      </div>
                    );
                  } else if (showPreview.fileType === 'application/pdf') {
                    return (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <iframe 
                          src={fullUrl} 
                          title={showPreview.title} 
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          sandbox="allow-scripts allow-same-origin allow-forms"
                        />
                        <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
                          <a href={fullUrl} target="_blank" rel="noreferrer" style={{ color: 'white', fontSize: '0.75rem', textDecoration: 'underline' }}>PDF blocked or not loading? Click to Open</a>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
                        <FileText size={80} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                        <p style={{ fontSize: '1.1rem' }}>Preview not available for this file type</p>
                        <p style={{ fontSize: '0.875rem' }}>{showPreview.title} ({showPreview.fileType || 'Unknown Type'})</p>
                        <a href={fullUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block' }}>Open Direct Link</a>
                      </div>
                    );
                  }
                })()
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
                  <FileText size={80} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                  <p style={{ fontSize: '1.1rem' }}>Sample Data Preview</p>
                  <p style={{ fontSize: '0.875rem' }}>{showPreview.title}</p>
                </div>
              )}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
               <button 
                 onClick={() => { handleDownload(showPreview); setShowPreview(null); }} 
                 style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: '0.5rem', 
                   padding: '0.75rem 1.5rem', 
                   borderRadius: '0.5rem', 
                   background: 'var(--primary)', 
                   color: 'white', 
                   border: 'none', 
                   cursor: 'pointer', 
                   fontWeight: 600,
                   transition: 'all 0.2s'
                 }}
               >
                 <Download size={18} /> Download Now
               </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
