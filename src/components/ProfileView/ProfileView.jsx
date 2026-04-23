import React, { useState, useContext } from 'react';
import { User, Mail, Phone, Building, ShieldCheck, Download, Trash2, Edit2, Save, X, ChevronDown, Calendar, Globe, Award, BookOpen, MapPin, Activity, Plus, FileText, Book, Grid, Layers, Building2 } from 'lucide-react';
import Card from '../Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from './ProfileView.module.css';

const ProfileView = ({ data, type, onSave, onDelete, onCancel }) => {
  const { 
    documents, addDocument, deleteDocument, attendance,
    departments, categories, degrees, subjects, 
    setDepartments, setCategories, setDegrees, setSubjects,
    currentUser 
  } = useContext(AppContext);
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
    { id: 'attendance', label: 'Attendance', icon: <Activity size={16} /> },
    { id: 'departments', label: 'Departments', icon: <Building2 size={16} /> },
    { id: 'categories', label: 'Categories', icon: <Layers size={16} /> },
    { id: 'degrees', label: 'Degrees', icon: <Grid size={16} /> },
    { id: 'subjects', label: 'Subjects', icon: <Book size={16} /> }
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
    </div>
  );
};

export default ProfileView;
