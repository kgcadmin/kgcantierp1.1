import React, { useContext, useState } from 'react';
import { Calendar, Users, History, Activity, FileText, Trash2, Plus } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from './Batches.module.css';
import ReportExportModal from '../../components/ReportExportModal/ReportExportModal';

const Batches = () => {
  const { batches, setBatches, updateBatchStatus, enrollments, students, currentUser, promoteBatch } = useContext(AppContext);

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const uniqueStatuses = Array.from(new Set(batches.map(b => b.status))).filter(Boolean);
  const uniqueCourses = Array.from(new Set(batches.map(b => b.courseId))).filter(Boolean);

  const filteredBatches = batches.filter(batch => {
    const matchesStatus = !statusFilter || batch.status === statusFilter;
    const matchesCourse = !courseFilter || batch.courseId === courseFilter;
    return matchesStatus && matchesCourse;
  });

  const handleStatusChange = (batchId, newStatus) => {
    updateBatchStatus(batchId, newStatus, {
      date: new Date().toISOString().split('T')[0],
      action: `Status changed to ${newStatus}`
    });
  };

  const getStudentsForBatch = (batchId) => {
    const enr = enrollments.filter(e => e.batchId === batchId);
    return enr.map(e => {
      const s = students.find(st => st.id === e.studentId);
      return { ...s, enrStatus: e.status };
    });
  };

  return (
    <div className={styles.batchesPage}>
      <div className={`${styles.header} mobile-stack`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 className={styles.title} style={{ margin: '0 0 0.5rem 0' }}>Batch Management</h1>
          <p className={styles.subtitle} style={{ margin: 0 }}>Handle lifecycle, track precise records, and manage batch status.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <option value="">All Courses</option>
            {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {currentUser?.role === 'Admin' && (
            <>
              <button onClick={() => {
                const name = window.prompt("Enter Batch Name:");
                const courseId = window.prompt("Enter Course ID (e.g., CRS01):");
                if (name && courseId) {
                  const newBatch = {
                    id: `BAT0${batches.length + 1}`,
                    name,
                    courseId,
                    status: 'Active',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                    history: [{ date: new Date().toISOString().split('T')[0], action: 'Batch created' }]
                  };
                  setBatches([...batches, newBatch]);
                }
              }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2e7d32', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                <Plus size={18} /> Add Batch
              </button>
              <button onClick={() => {
                const batchId = window.prompt("Enter Batch ID to promote (e.g., BAT01):");
                const nextBatchId = window.prompt("Enter Next Level Batch ID (e.g., BAT03):");
                if (batchId && nextBatchId) {
                  promoteBatch(batchId, nextBatchId);
                  alert("Batch promoted successfully!");
                }
              }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#388e3c', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                <BookOpen size={18} /> Promote
              </button>
            </>
          )}
          <button onClick={() => setShowReports(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <FileText size={18} /> Reports
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredBatches.map(batch => (
          <Card key={batch.id} className={styles.batchCard}>
            <div className={styles.batchHeader}>
              <h2 className={styles.batchName}>{batch.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <select 
                  className={`${styles.statusSelect} ${styles[batch.status.toLowerCase()]}`}
                  value={batch.status}
                  onChange={(e) => handleStatusChange(batch.id, e.target.value)}
                  disabled={currentUser?.role !== 'Admin'}
                  style={{ opacity: currentUser?.role !== 'Admin' ? 0.7 : 1, cursor: currentUser?.role !== 'Admin' ? 'not-allowed' : 'pointer' }}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
                {currentUser?.role === 'Admin' && (
                  <button className={styles.deleteBatchBtn} onClick={() => setBatches(batches.filter(b => b.id !== batch.id))}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
            
            <div className={styles.batchDetails}>
              <div className={styles.detail}>
                <Calendar size={16} /> <span>{batch.startDate} to {batch.endDate}</span>
              </div>
              <div className={styles.detail}>
                <BookOpen size={16} /> <span>Course ID: {batch.courseId}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.viewBtn} 
                onClick={() => setSelectedBatch(selectedBatch === batch.id ? null : batch.id)}
              >
                {selectedBatch === batch.id ? 'Hide Details' : 'View Data & History'}
              </button>
            </div>

            {selectedBatch === batch.id && (
              <div className={styles.expandedArea}>
                <div className={styles.historySection}>
                  <h3><History size={16} /> Batch History</h3>
                  <ul className={styles.historyList}>
                    {batch.history.map((h, i) => (
                      <li key={i}>
                        <strong>{h.date}:</strong> {h.action}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={styles.studentsSection}>
                  <h3><Users size={16} /> Enrolled Students</h3>
                  {getStudentsForBatch(batch.id).length > 0 ? (
                  <div className="table-responsive">
                    <table className={styles.studentsTable}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getStudentsForBatch(batch.id).map(s => (
                          <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.name}</td>
                            <td>{s.enrStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  ) : (
                    <p className={styles.noStudents}>No students enrolled in this batch.</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <ReportExportModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        title="Batch"
        data={batches}
        columns={[
          { key: 'id', label: 'Batch ID' },
          { key: 'name', label: 'Name' },
          { key: 'courseId', label: 'Course ID' },
          { key: 'facultyId', label: 'Faculty ID' },
          { key: 'startDate', label: 'Start Date' },
          { key: 'endDate', label: 'End Date' },
          { key: 'status', label: 'Status' }
        ]}
        filters={[
          { key: 'status', label: 'Status', options: Array.from(new Set(batches.map(b => b.status))).filter(Boolean).map(s => ({ value: s, label: s })) },
          { key: 'courseId', label: 'Course', options: Array.from(new Set(batches.map(b => b.courseId))).filter(Boolean).map(c => ({ value: c, label: c })) }
        ]}
      />
    </div>
  );
};

// Need this extra import since I missed BookOpen in the main import
import { BookOpen } from 'lucide-react';
export default Batches;
