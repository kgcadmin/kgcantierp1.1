import React, { useState, useContext } from 'react';
import { User, Mail, Phone, Building, ShieldCheck, Download, Trash2, Edit2, Save, X, ChevronDown, Calendar, Globe, Award, BookOpen, MapPin, Activity, Plus, FileText } from 'lucide-react';
import Card from '../Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from './ProfileView.module.css';

const ProfileView = ({ data, type, onSave, onDelete, onCancel }) => {
  const { documents, addDocument, deleteDocument, attendance } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...data });
  const [activeTab, setActiveTab] = useState('personal');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  const handlePhotoChange = () => {
    const url = window.prompt("Enter new photo URL (or leave blank for default):");
    if (url !== null) handleChange(null, 'photo', url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleMenuClick = (item) => {
    setShowProfileMenu(false);
    const tabMap = {
      'Document': 'documents',
      'Attendance': 'attendance',
      'Subject': 'academic',
      'Qualification': 'academic',
      'Timetable': 'academic'
    };
    if (tabMap[item]) setActiveTab(tabMap[item]);
    else alert(`Requested view for ${item} is currently synchronized with the ${tabMap['Subject']} tab.`);
  };


  const handleUploadDoc = () => {
    const title = window.prompt("Enter Document Title:");
    if (title) {
      addDocument({
        title,
        category: 'Profile Attachment',
        type: 'Upload',
        visibility: 'Student-Specific',
        studentId: formData.id,
        dateAdded: new Date().toISOString().split('T')[0]
      });
      alert("Document uploaded successfully!");
    }
  };

  const userDocuments = documents.filter(d => d.studentId === formData.id);
  const userAttendance = attendance.filter(a => a.records && a.records[formData.id]);

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User size={16} /> },
    { id: 'academic', label: 'Academic', icon: <Award size={16} /> },
    { id: 'documents', label: 'Documents', icon: <BookOpen size={16} /> },
    { id: 'attendance', label: 'Attendance', icon: <Activity size={16} /> }
  ];

  const renderField = (label, value, field, section = null) => {
    const displayValue = section ? formData[section]?.[field] : formData[field];
    
    return (
      <div className={styles.fieldItem}>
        <label className={styles.fieldLabel}>{label}</label>
        {isEditing ? (
          <input 
            type="text" 
            className={styles.fieldInput}
            value={displayValue || ''}
            onChange={(e) => handleChange(section, field, e.target.value)}
          />
        ) : (
          <div className={styles.fieldValue}>{displayValue || 'N/A'}</div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.profileContainer}>
      {/* Sidebar */}
      <Card className={styles.sidebar}>
        <div className={styles.photoSection}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              {formData.photo ? <img src={formData.photo} alt={formData.name} /> : formData.name?.charAt(0)}
            </div>
            <button className={styles.cameraBtn} onClick={handlePhotoChange} title="Change Photo">
              <Plus size={16} />
            </button>
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


      {/* Main Content */}
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
            <>
              <div className={styles.sectionTitle}><User size={20} /> Personal Information</div>
              <div className={styles.gridFields}>
                {renderField('Full Name', formData.name, 'name')}
                {renderField('Roll No', formData.rollNo, 'rollNo')}
                {renderField('GR Number', formData.grNumber, 'grNumber')}
                {renderField('Certificate Name', formData.personalDetails?.certificateName, 'certificateName', 'personalDetails')}
                {renderField('Gender', formData.personalDetails?.gender, 'gender', 'personalDetails')}
                {renderField('Date of Birth', formData.personalDetails?.dob, 'dob', 'personalDetails')}
                {renderField('Mother Name', formData.personalDetails?.motherName, 'motherName', 'personalDetails')}
                {renderField('Father Name', formData.personalDetails?.fatherName, 'fatherName', 'personalDetails')}
                {renderField('Nationality', formData.personalDetails?.nationality, 'nationality', 'personalDetails')}
                {renderField('Religion', formData.personalDetails?.religion, 'religion', 'personalDetails')}
                {renderField('Cast', formData.personalDetails?.cast, 'cast', 'personalDetails')}
                {renderField('Birth Place', formData.personalDetails?.birthPlace, 'birthPlace', 'personalDetails')}
                {renderField('Bloodgroup', formData.personalDetails?.bloodgroup, 'bloodgroup', 'personalDetails')}
                {renderField('Languages', formData.personalDetails?.languages, 'languages', 'personalDetails')}
                {renderField('Hobbies', formData.personalDetails?.hobbies, 'hobbies', 'personalDetails')}
                {renderField('NRIC No', formData.personalDetails?.nricNo, 'nricNo', 'personalDetails')}
                {renderField('Resident', formData.personalDetails?.resident, 'resident', 'personalDetails')}
                {renderField('Library Book Quota', formData.personalDetails?.libraryQuota, 'libraryQuota', 'personalDetails')}
                {renderField('Passport No', formData.personalDetails?.passportNo, 'passportNo', 'personalDetails')}
                {renderField('Visa Expiry Date', formData.personalDetails?.visaExpiry, 'visaExpiry', 'personalDetails')}
              </div>

            </>
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
              
              {formData.academicHistory && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Academic History</h3>
                  <div className={styles.tableContainer}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 0' }}>Semester</th>
                          <th style={{ padding: '0.75rem 0' }}>GPA</th>
                          <th style={{ padding: '0.75rem 0' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.academicHistory.map((hist, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem 0' }}>{hist.semester}</td>
                            <td style={{ padding: '1rem 0' }}>{hist.gpa}</td>
                            <td style={{ padding: '1rem 0' }}>
                              <span style={{ padding: '0.25rem 0.5rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>{hist.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'documents' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className={styles.sectionTitle} style={{ margin: 0, border: 0 }}><BookOpen size={20} /> Personal Documents</div>
                <button className={styles.btn} onClick={handleUploadDoc}><Plus size={16} /> Upload New</button>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionBtn} onClick={() => alert('Downloading...')}><Download size={16} /></button>
                      <button className={styles.actionBtn} style={{ color: '#c62828' }} onClick={() => deleteDocument(doc.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {userDocuments.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <p>No personal documents found.</p>
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
                {userAttendance.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <p>No attendance data available for this period.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfileView;
