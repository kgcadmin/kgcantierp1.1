import React, { useState, useContext } from 'react';
import { Search, Plus, Edit2, Trash2, UserCircle, BookOpen, FileText, Upload } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from './Students.module.css';
import ReportExportModal from '../../components/ReportExportModal/ReportExportModal';
import ProfileView from '../../components/ProfileView/ProfileView';
import AddEntryModal from '../../components/AddEntryModal';
import ModuleGuide from '../../components/ModuleGuide';

const Students = () => {
  const { students, addStudent, editStudent, deleteStudent, enrollStudent, currentUser, batches, enrollments, promoteBatch, processCSV, departments } = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showReports, setShowReports] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(null); // studentId

  const relevantStudents = currentUser?.role === 'Faculty'
    ? students.filter(s => {
        const myBatches = batches.filter(b => b.facultyId === currentUser.linkedId);
        const myEnrolls = enrollments.filter(e => myBatches.some(b => b.id === e.batchId));
        return myEnrolls.some(e => e.studentId === s.id);
      })
    : students;

  const filteredStudents = relevantStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = Array.from(new Set(relevantStudents.map(s => s.status))).filter(Boolean);

  const handlePromote = (data) => {
    if (data.batchId) promoteBatch(data.batchId);
  };

  const handleAddSubmit = (data) => {
    const id = `STU00${students.length + 1}`;
    addStudent({ 
      ...data,
      id, 
      rollNo: `ROL${Date.now().toString().slice(-4)}`, 
      grNumber: `GR${Date.now().toString().slice(-5)}`, 
      year: 'Freshman', 
      status: 'Active', 
      gpa: 0, 
      profileStatus: 'Pending Docs', 
      academicHistory: [],
      password: `Pass@${id}`,
      personalDetails: {}
    });
  };

  return (
    <div className={`${styles.studentsPage} page-animate`}>
      <ModuleGuide 
        role={currentUser?.role}
        adminText="Manage student records, batch enrollments, and execute batch promotions."
        staffText="View student records and process enrollments."
      />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Information System (SIS)</h1>
          <p className={styles.subtitle}>Methodical student information, academic history, and reports.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['Admin', 'Office Staff'].includes(currentUser?.role) && (
            <>
              <button onClick={() => setShowAddModal(true)} className={styles.primaryBtn}>
                <Plus size={18} />
                <span>Add Student</span>
              </button>
              <label className={styles.primaryBtn} style={{ background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <Upload size={18} />
                <span>Import CSV</span>
                <input type="file" accept=".csv" onChange={(e) => processCSV(e, 'student')} style={{ display: 'none' }} />
              </label>
              {currentUser?.role === 'Admin' && (
                <button onClick={() => setShowPromoteModal(true)} className={styles.primaryBtn} style={{ background: '#388e3c' }}>
                  <BookOpen size={18} />
                  <span>Promote Batch</span>
                </button>
              )}
            </>
          )}
          <button onClick={() => setShowReports(true)} className={styles.primaryBtn} style={{ background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <FileText size={18} />
            <span>Reports</span>
          </button>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <Card className={styles.tableCard}>
          <div className={styles.tableToolbar}>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} size={18} />
              <input 
                type="text" 
                placeholder="Search by ID or Name..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <option value="">All Status</option>
              {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} onClick={() => setSelectedStudent(student)} style={{ cursor: 'pointer', background: selectedStudent?.id === student.id ? 'var(--surface-hover)' : 'transparent' }}>
                    <td className={styles.idCell}>{student.id}</td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{student.rollNo}</td>
                    <td className={styles.nameCell}>
                      <div className={styles.studentAvatar}>
                        {student.name.charAt(0)}
                      </div>
                      {student.name}
                    </td>

                    <td>
                      <span className={`${styles.status} ${student.status === 'Active' ? styles.statusActive : student.status === 'Probation' ? styles.statusWarning : styles.statusInactive}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {['Admin', 'Office Staff'].includes(currentUser?.role) && (
                          <>
                            <button 
                              className={styles.actionBtn} 
                              title="Enroll in Batch"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEnrollModal(student.id);
                              }}
                            >
                              <Plus size={16} />
                            </button>
                            {currentUser?.role === 'Admin' && (
                              <button className={styles.actionBtn} title="Delete" onClick={(e) => { e.stopPropagation(); deleteStudent(student.id); }}><Trash2 size={16} /></button>
                            )}
                          </>
                        )}
                        {!['Admin', 'Office Staff'].includes(currentUser?.role) && (
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>View Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="4" className={styles.emptyState}>
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {selectedStudent && (
          <ProfileView 
            data={selectedStudent} 
            type="Student"
            onSave={(updated) => {
              editStudent(updated.id, updated);
              setSelectedStudent(updated);
            }}
            onDelete={(id) => {
              deleteStudent(id);
              setSelectedStudent(null);
            }}
            onCancel={() => setSelectedStudent(null)}
          />
        )}
      </div>

      <AddEntryModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSubmit}
        title="Add New Student"
        fields={[
          { name: 'name', label: 'Full Name', required: true, placeholder: 'e.g. John Doe' },
          { name: 'email', label: 'Personal Email (for login)', required: true, placeholder: 'e.g. john@gmail.com' },
          { 
            name: 'department', 
            label: 'Department', 
            type: 'select', 
            required: true, 
            options: (departments || []).map(d => ({ value: d.name, label: d.name })) 
          }
        ]}
      />

      <AddEntryModal 
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        onSave={handlePromote}
        title="Promote Batch"
        fields={[
          { 
            name: 'batchId', 
            label: 'Batch', 
            type: 'select', 
            required: true, 
            options: (batches || []).map(b => ({ value: b.id, label: b.name })) 
          }
        ]}
      />

      <AddEntryModal 
        isOpen={!!showEnrollModal}
        onClose={() => setShowEnrollModal(null)}
        onSave={(data) => {
          if (data.batchId) enrollStudent(showEnrollModal, data.batchId);
        }}
        title="Enroll in Batch"
        fields={[
          { 
            name: 'batchId', 
            label: 'Batch', 
            type: 'select', 
            required: true, 
            options: (batches || []).map(b => ({ value: b.id, label: b.name })) 
          }
        ]}
      />

      <ReportExportModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        title="Student"
        data={relevantStudents}
        columns={[
          { key: 'id', label: 'Student ID' },
          { key: 'rollNo', label: 'Roll No' },
          { key: 'grNumber', label: 'GR Number' },
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'department', label: 'Department' },
          { key: 'year', label: 'Year' },
          { key: 'gpa', label: 'GPA' },
          { key: 'status', label: 'Status' }

        ]}
        filters={[
          { key: 'status', label: 'Status', options: Array.from(new Set(relevantStudents.map(s => s.status))).filter(Boolean).map(s => ({ value: s, label: s })) },
          { key: 'department', label: 'Department', options: Array.from(new Set(relevantStudents.map(s => s.department))).filter(Boolean).map(d => ({ value: d, label: d })) },
          { key: 'year', label: 'Year', options: Array.from(new Set(relevantStudents.map(s => s.year))).filter(Boolean).map(y => ({ value: y, label: y })) },
          { key: 'profileStatus', label: 'Profile Status', options: Array.from(new Set(relevantStudents.map(s => s.profileStatus))).filter(Boolean).map(p => ({ value: p, label: p })) }
        ]}
      />
    </div>
  );
};

export default Students;
