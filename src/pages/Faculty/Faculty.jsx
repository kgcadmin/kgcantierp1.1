import React, { useState, useContext } from 'react';
import { Search, Plus, Edit2, Trash2, UserCircle, FileText } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from '../Students/Students.module.css';
import ReportExportModal from '../../components/ReportExportModal/ReportExportModal';
import ProfileView from '../../components/ProfileView/ProfileView';

const Faculty = () => {
  const { faculty, addFaculty, editFaculty, deleteFaculty, currentUser } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showReports, setShowReports] = useState(false);

  const uniqueDepts = Array.from(new Set(faculty.map(f => f.department))).filter(Boolean);
  const uniqueStatuses = Array.from(new Set(faculty.map(f => f.status))).filter(Boolean);

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !deptFilter || member.department === deptFilter;
    const matchesStatus = !statusFilter || member.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAddFaculty = () => {
    const name = window.prompt("Enter Faculty Name:");
    const department = window.prompt("Enter Department:");
    const role = window.prompt("Enter Role:");
    if (name && department && role) {
      addFaculty({ name, department, role, status: 'Active' });
    }
  };

  const handleEditFaculty = (member) => {
    const name = window.prompt("Edit Faculty Name:", member.name);
    const department = window.prompt("Edit Department:", member.department);
    const role = window.prompt("Edit Role:", member.role);
    const status = window.prompt("Edit Status (Active/Inactive):", member.status);
    if (name && department && role && status) {
      editFaculty(member.id, { name, department, role, status });
    }
  };

  return (
    <div className={styles.studentsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Faculty Directory</h1>
          <p className={styles.subtitle}>Manage faculty members, roles, and departments.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {currentUser?.role !== 'Management' && (
            <button onClick={handleAddFaculty} className={styles.primaryBtn}>
              <Plus size={18} />
              <span>Add Faculty</span>
            </button>
          )}
          <button onClick={() => setShowReports(true)} className={styles.primaryBtn} style={{ background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <FileText size={18} />
            <span>Reports</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedFaculty ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
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
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <option value="">All Departments</option>
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
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
                  <th>Faculty ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map((member) => (
                  <tr key={member.id} onClick={() => setSelectedFaculty(member)} style={{ cursor: 'pointer', background: selectedFaculty?.id === member.id ? 'var(--surface-hover)' : 'transparent' }}>
                    <td className={styles.idCell}>{member.id}</td>
                    <td className={styles.nameCell}>
                      <div className={styles.studentAvatar}>
                        {member.name.replace('Dr. ', '').replace('Prof. ', '').charAt(0)}
                      </div>
                      {member.name}
                    </td>
                    <td>{member.department}</td>
                    <td>{member.role}</td>
                    <td>
                      <span className={`${styles.status} ${member.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                        {member.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} id={`faculty-edit-${member.id}`} onClick={(e) => { e.stopPropagation(); handleEditFaculty(member); }}><Edit2 size={16} /></button>
                        <button className={styles.actionBtn} id={`faculty-delete-${member.id}`} onClick={(e) => { e.stopPropagation(); deleteFaculty(member.id); }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFaculty.length === 0 && (
                  <tr>
                    <td colSpan="6" className={styles.emptyState}>
                      No faculty found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {selectedFaculty && (
          <ProfileView 
            data={selectedFaculty} 
            type="Faculty"
            onSave={(updated) => {
              editFaculty(updated.id, updated);
              setSelectedFaculty(updated);
            }}
            onDelete={(id) => {
              deleteFaculty(id);
              setSelectedFaculty(null);
            }}
            onCancel={() => setSelectedFaculty(null)}
          />
        )}
      </div>

      <ReportExportModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        title="Faculty"
        data={faculty}
        columns={[
          { key: 'id', label: 'Faculty ID' },
          { key: 'name', label: 'Name' },
          { key: 'department', label: 'Department' },
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status' }
        ]}
        filters={[
          { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
          { key: 'department', label: 'Department', options: Array.from(new Set(faculty.map(f => f.department))).filter(Boolean).map(d => ({ value: d, label: d })) },
          { key: 'role', label: 'Role', options: Array.from(new Set(faculty.map(f => f.role))).filter(Boolean).map(r => ({ value: r, label: r })) }
        ]}
      />
    </div>
  );
};

export default Faculty;
