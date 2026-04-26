import React, { useContext, useState } from 'react';
import { PenTool, CheckCircle, Clock, Plus, Download, FileText } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import ReportExportModal from '../../components/ReportExportModal/ReportExportModal';
import AddEntryModal from '../../components/AddEntryModal';

const Exams = () => {
  const { exams, courses, addExam, currentUser, enrollments, batches } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showReports, setShowReports] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const getCourseTitle = (id) => courses.find(c => c.id === id)?.title || id;

  const relevantExams = currentUser?.role === 'Student' 
    ? exams.filter(e => {
        const myEnrollments = enrollments.filter(en => en.studentId === currentUser.linkedId);
        const myCourseIds = myEnrollments.map(en => batches.find(b => b.id === en.batchId)?.courseId).filter(Boolean);
        return myCourseIds.includes(e.courseId);
      })
    : currentUser?.role === 'Faculty'
    ? exams.filter(e => {
        const myBatches = batches.filter(b => b.facultyId === currentUser.linkedId);
        const myCourseIds = myBatches.map(b => b.courseId).filter(Boolean);
        return myCourseIds.includes(e.courseId);
      })
    : exams;

  const uniqueCourses = Array.from(new Set(relevantExams.map(e => e.courseId))).filter(Boolean);
  const uniqueTypes = Array.from(new Set(relevantExams.map(e => e.type))).filter(Boolean);

  const filteredExams = relevantExams.filter(exam => {
    const matchesTab = activeTab === 'upcoming' ? exam.status === 'Scheduled' : exam.status === 'Evaluated';
    const matchesCourse = !courseFilter || exam.courseId === courseFilter;
    const matchesType = !typeFilter || exam.type === typeFilter;
    return matchesTab && matchesCourse && matchesType;
  });

  const upcomingCount = relevantExams.filter(e => e.status === 'Scheduled').length;
  const evaluatedCount = relevantExams.filter(e => e.status === 'Evaluated').length;

  const handleScheduleSubmit = (data) => {
    if (data.title && data.courseId && data.date && data.type) {
      addExam({ ...data, status: 'Scheduled' });
      setShowAddModal(false);
    }
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Exam Management System</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage schedules, evaluate results, and process re-evaluations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['Admin', 'Faculty'].includes(currentUser?.role) && (
            <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <Plus size={18} /> Schedule Exam
            </button>
          )}
          <button onClick={() => setShowReports(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <FileText size={18} /> Reports
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: activeTab === 'upcoming' ? '2px solid var(--primary)' : '1px solid transparent' }} onClick={() => setActiveTab('upcoming')}>
          <div style={{ color: '#f57c00' }}><Clock size={24} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Upcoming Exams</p>
            <h2 style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>{upcomingCount}</h2>
          </div>
        </Card>
        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: activeTab === 'evaluated' ? '2px solid var(--primary)' : '1px solid transparent' }} onClick={() => setActiveTab('evaluated')}>
          <div style={{ color: '#388e3c' }}><CheckCircle size={24} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Evaluated / Results Published</p>
            <h2 style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>{evaluatedCount}</h2>
          </div>
        </Card>
      </div>

      <Card style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{activeTab === 'upcoming' ? 'Scheduled Examinations' : 'Result Analytics'}</h2>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <option value="">All Courses</option>
              {uniqueCourses.map(c => <option key={c} value={c}>{getCourseTitle(c)}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <option value="">All Types</option>
              {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {currentUser?.role !== 'Student' && (
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
              <Download size={16} /> Export Reports
            </button>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              <th style={{ padding: '0.75rem' }}>Exam ID</th>
              <th style={{ padding: '0.75rem' }}>Title</th>
              <th style={{ padding: '0.75rem' }}>Course</th>
              <th style={{ padding: '0.75rem' }}>Type</th>
              <th style={{ padding: '0.75rem' }}>Date</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredExams.map(exam => (
              <tr key={exam.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{exam.id}</td>
                <td style={{ padding: '1rem 0.75rem', color: 'var(--text-primary)' }}>{exam.title}</td>
                <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{getCourseTitle(exam.courseId)}</td>
                <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{exam.type}</td>
                <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{exam.date}</td>
                <td style={{ padding: '1rem 0.75rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: exam.status === 'Evaluated' ? '#e8f5e9' : '#fff3e0',
                    color: exam.status === 'Evaluated' ? '#2e7d32' : '#e65100'
                  }}>
                    {exam.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ReportExportModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        title="Exam"
        data={relevantExams}
        columns={[
          { key: 'id', label: 'Exam ID' },
          { key: 'title', label: 'Title' },
          { key: 'courseId', label: 'Course ID' },
          { key: 'date', label: 'Date' },
          { key: 'type', label: 'Type' },
          { key: 'status', label: 'Status' }
        ]}
        filters={[
          { key: 'status', label: 'Status', options: Array.from(new Set(relevantExams.map(e => e.status))).filter(Boolean).map(s => ({ value: s, label: s })) },
          { key: 'type', label: 'Type', options: Array.from(new Set(relevantExams.map(e => e.type))).filter(Boolean).map(t => ({ value: t, label: t })) },
          { key: 'courseId', label: 'Course', options: Array.from(new Set(relevantExams.map(e => e.courseId))).filter(Boolean).map(c => ({ value: c, label: getCourseTitle(c) })) }
        ]}
      />

      <AddEntryModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleScheduleSubmit}
        title="Schedule New Examination"
        fields={[
          { name: 'title', label: 'Exam Title', required: true, placeholder: 'e.g. Midterm: Data Structures' },
          { 
            name: 'courseId', 
            label: 'Course', 
            type: 'select', 
            required: true, 
            options: courses.map(c => ({ value: c.id, label: c.title })) 
          },
          { name: 'date', label: 'Exam Date', type: 'date', required: true },
          { 
            name: 'type', 
            label: 'Exam Type', 
            type: 'select', 
            required: true, 
            options: [
              { value: 'Descriptive', label: 'Descriptive' },
              { value: 'Objective', label: 'Objective' },
              { value: 'Practical', label: 'Practical' }
            ] 
          }
        ]}
      />
    </div>
  );
};

export default Exams;
