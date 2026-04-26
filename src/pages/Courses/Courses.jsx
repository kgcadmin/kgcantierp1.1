import React, { useState, useContext } from 'react';
import { Search, Plus, Book, Clock, User, FileText } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from './Courses.module.css';
import ReportExportModal from '../../components/ReportExportModal/ReportExportModal';
import AddEntryModal from '../../components/AddEntryModal';

const Courses = () => {
  const { courses, addCourse, editCourse, deleteCourse, degrees, categories, subjects, currentUser } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReports, setShowReports] = useState(false);
  const [instructorFilter, setInstructorFilter] = useState('');
  const [creditsFilter, setCreditsFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const uniqueInstructors = Array.from(new Set(courses.map(c => c.instructor))).filter(Boolean);
  const uniqueCredits = Array.from(new Set(courses.map(c => String(c.credits)))).filter(Boolean);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInstructor = !instructorFilter || course.instructor === instructorFilter;
    const matchesCredits = !creditsFilter || String(course.credits) === creditsFilter;
    return matchesSearch && matchesInstructor && matchesCredits;
  });

  const getDegreeName = (id) => degrees.find(d => d.id === id)?.name || 'Unknown Degree';
  const getCategoryForDegree = (degId) => {
    const catId = degrees.find(d => d.id === degId)?.categoryId;
    return categories.find(c => c.id === catId)?.name || '';
  };
  const getSubjectNames = (subIds) => subIds.map(id => subjects.find(s => s.id === id)?.name).join(', ');

  const handleSaveCourse = (data) => {
    if (editingCourse) {
      editCourse(editingCourse.id, { ...data, credits: Number(data.credits) });
      setEditingCourse(null);
    } else {
      addCourse({ ...data, credits: Number(data.credits), subjects: [], schedule: 'TBD' });
      setShowAddModal(false);
    }
  };

  return (
    <div className={`${styles.coursesPage} page-animate`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Course Management</h1>
          <p className={styles.subtitle}>Map courses to degrees, assign subjects, and manage history.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {currentUser?.role !== 'Student' && currentUser?.role !== 'Faculty' && (
            <button onClick={() => setShowAddModal(true)} className={styles.primaryBtn}>
              <Plus size={18} />
              <span>Add Course</span>
            </button>
          )}
          <button onClick={() => setShowReports(true)} className={styles.primaryBtn} style={{ background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <FileText size={18} />
            <span>Reports</span>
          </button>
        </div>
      </div>

      <div className={styles.toolbar} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={instructorFilter}
          onChange={(e) => setInstructorFilter(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
        >
          <option value="">All Instructors</option>
          {uniqueInstructors.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <select
          value={creditsFilter}
          onChange={(e) => setCreditsFilter(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
        >
          <option value="">All Credits</option>
          {uniqueCredits.map(cr => <option key={cr} value={cr}>{cr} Credits</option>)}
        </select>
      </div>

      <div className={styles.courseGrid}>
        {filteredCourses.map(course => (
          <Card key={course.id} className={styles.courseCard}>
            <div className={styles.courseHeader}>
              <div className={styles.courseIcon}>
                <Book size={24} />
              </div>
              <span className={styles.courseId}>{course.id}</span>
            </div>
            <h3 className={styles.courseTitle}>{course.title}</h3>
            
            <div className={styles.degreeInfo} style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>
              <strong>{getDegreeName(course.degreeId)}</strong>
              <br/>
              <span style={{fontSize: '0.75rem'}}>{getCategoryForDegree(course.degreeId)}</span>
            </div>

            <div className={styles.courseDetails}>
              <div className={styles.detailItem}>
                <User size={16} />
                <span>{course.instructor}</span>
              </div>
              <div className={styles.detailItem}>
                <Clock size={16} />
                <span>{course.schedule}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.creditsBadge}>{course.credits} Credits</span>
              </div>
            </div>

            <div style={{marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.875rem'}}>
              <strong>Assigned Subjects:</strong>
              <p style={{margin: '0.25rem 0 1rem 0', color: 'var(--text-secondary)'}}>{getSubjectNames(course.subjects)}</p>
              
              {currentUser?.role !== 'Student' && currentUser?.role !== 'Faculty' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button onClick={() => setEditingCourse(course)} style={{ flex: 1, padding: '0.5rem', background: 'var(--surface-hover)', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer', color: 'var(--text-primary)' }}>Edit</button>
                  <button onClick={() => deleteCourse(course.id)} style={{ flex: 1, padding: '0.5rem', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '0.25rem', cursor: 'pointer', color: '#c62828' }}>Delete</button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {filteredCourses.length === 0 && (
          <div className={styles.emptyState}>No courses found.</div>
        )}
      </div>

      <ReportExportModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        title="Course"
        data={courses}
        columns={[
          { key: 'id', label: 'Course ID' },
          { key: 'title', label: 'Title' },
          { key: 'instructor', label: 'Instructor' },
          { key: 'credits', label: 'Credits' }
        ]}
        filters={[
          { key: 'instructor', label: 'Instructor', options: Array.from(new Set(courses.map(c => c.instructor))).filter(Boolean).map(i => ({ value: i, label: i })) },
          { key: 'credits', label: 'Credits', options: Array.from(new Set(courses.map(c => String(c.credits)))).filter(Boolean).map(cr => ({ value: cr, label: `${cr} Credits` })) }
        ]}
      />

      <AddEntryModal 
        isOpen={showAddModal || !!editingCourse}
        onClose={() => { setShowAddModal(false); setEditingCourse(null); }}
        onSave={handleSaveCourse}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
        fields={[
          { name: 'title', label: 'Course Title', required: true, placeholder: 'e.g. Mechanical Engineering' },
          { name: 'instructor', label: 'Instructor', required: true, placeholder: 'e.g. Dr. Robert Smith' },
          { name: 'credits', label: 'Credits', type: 'number', required: true, placeholder: '4' },
          { 
            name: 'degreeId', 
            label: 'Degree', 
            type: 'select', 
            required: true, 
            options: degrees.map(d => ({ value: d.id, label: d.name })) 
          }
        ]}
      />
    </div>
  );
};

export default Courses;
