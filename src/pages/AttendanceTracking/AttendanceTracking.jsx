import React, { useContext, useState, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Download, 
  FileSpreadsheet,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  LogIn,
  LogOut,
  Save,
  Edit2
} from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import Card from '../../components/Card/Card';
import ModuleGuide from '../../components/ModuleGuide';

const AttendanceTracking = () => {
  const { 
    attendance, 
    markAttendance, 
    batches, 
    subjects, 
    enrollments, 
    students, 
    currentUser,
    courses,
    faculty,
    staff,
    staffAttendance,
    markStaffAttendance
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('summary');
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.code || '');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentRecords, setCurrentRecords] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [staffDate, setStaffDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffMemberType, setStaffMemberType] = useState('faculty');
  const [editingRow, setEditingRow] = useState(null);
  const [entryForm, setEntryForm] = useState({ entryTime: '', exitTime: '', status: 'Present' });

  // ── Summary filters ──
  const [showFilters, setShowFilters] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterThreshold, setFilterThreshold] = useState(0); // show students below this %
  const [filterViewType, setFilterViewType] = useState('Students'); // 'Students' | 'Faculty' | 'Staff'

  // Memoized stats for summary
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(a => a.date === today);
    
    let presentToday = 0;
    let totalToday = 0;
    
    todayRecords.forEach(record => {
      Object.values(record.records).forEach(status => {
        totalToday++;
        if (status === 'Present') presentToday++;
      });
    });

    const averageAttendance = attendance.length > 0 ? (() => {
        let total = 0;
        let present = 0;
        attendance.forEach(a => {
            Object.values(a.records).forEach(status => {
                total++;
                if (status === 'Present') present++;
            });
        });
        return total > 0 ? (present / total * 100).toFixed(1) : 0;
    })() : 0;

    return {
      totalStudents,
      presentToday,
      todayRate: totalToday > 0 ? (presentToday / totalToday * 100).toFixed(1) : 0,
      averageAttendance,
      lowAttendanceCount: students.filter(s => {
          // Calculate individual attendance rate (dummy logic for now)
          return Math.random() < 0.1; // 10% students have low attendance in this demo
      }).length
    };
  }, [attendance, students]);

  // Selected student data
  const selectedStudentData = useMemo(() => {
    if (!selectedStudentId) return null;
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return null;

    const studentAttendance = attendance.filter(a => a.records[selectedStudentId]);
    const totalSessions = studentAttendance.length;
    const presentSessions = studentAttendance.filter(a => a.records[selectedStudentId] === 'Present').length;
    
    // Subject-wise breakdown for this student
    const subjectBreakdown = subjects.map(sub => {
        const subAttendance = studentAttendance.filter(a => a.subjectId === sub.code);
        const subTotal = subAttendance.length;
        const subPresent = subAttendance.filter(a => a.records[selectedStudentId] === 'Present').length;
        return {
            ...sub,
            total: subTotal,
            present: subPresent,
            rate: subTotal > 0 ? (subPresent / subTotal * 100).toFixed(1) : 0
        };
    });

    return {
        ...student,
        totalSessions,
        presentSessions,
        rate: totalSessions > 0 ? (presentSessions / totalSessions * 100).toFixed(1) : 0,
        history: studentAttendance.sort((a, b) => new Date(b.date) - new Date(a.date)),
        subjectBreakdown
    };
  }, [selectedStudentId, attendance, students, subjects]);

  // Handle marking attendance
  const handleMarkAttendance = () => {
    if (!selectedBatch || !selectedSubject) {
      alert("Please select both batch and subject.");
      return;
    }
    markAttendance(selectedBatch, markDate, currentRecords, selectedSubject);
    alert("Attendance marked successfully!");
  };

  // ── Derived filter options ──
  const uniqueDepts = ['All', ...Array.from(new Set(students.map(s => s.department).filter(Boolean)))];
  const uniqueYears = ['All', ...Array.from(new Set(students.map(s => s.year).filter(Boolean)))];

  // ── Filtered summary list ──
  const filteredSummaryStudents = useMemo(() => {
    return students.filter(student => {
      const matchSearch = !filterSearch || student.name.toLowerCase().includes(filterSearch.toLowerCase()) || student.id.toLowerCase().includes(filterSearch.toLowerCase());
      const matchDept = filterDept === 'All' || student.department === filterDept;
      const matchYear = filterYear === 'All' || student.year === filterYear;

      const matchCourse = filterCourse === 'All' || (() => {
        const batch = batches.find(b => b.courseId === filterCourse);
        if (!batch) return false;
        return enrollments.some(e => e.studentId === student.id && e.batchId === batch.id);
      })();

      const matchSubjectRate = filterSubject === 'All' || (() => {
        const subAtd = attendance.filter(a => a.subjectId === filterSubject && a.records[student.id]);
        return subAtd.length > 0;
      })();

      // Calculate rate for threshold filter
      const studentAtd = filterSubject !== 'All'
        ? attendance.filter(a => a.subjectId === filterSubject && a.records[student.id])
        : attendance.filter(a => a.records[student.id]);
      const total = studentAtd.length;
      const present = studentAtd.filter(a => a.records[student.id] === 'Present').length;
      const rate = total > 0 ? (present / total * 100) : 100;
      const matchThreshold = filterThreshold === 0 || rate <= filterThreshold;

      return matchSearch && matchDept && matchYear && matchCourse && matchSubjectRate && matchThreshold;
    });
  }, [students, filterSearch, filterDept, filterYear, filterCourse, filterSubject, filterThreshold, attendance, batches, enrollments]);

  // Yearly report logic
  const yearlyData = useMemo(() => {
    if (activeTab !== 'yearly' || !selectedBatch || !selectedSubject) return [];
    
    const batchStudents = enrollments
      .filter(e => e.batchId === selectedBatch)
      .map(e => students.find(s => s.id === e.studentId))
      .filter(Boolean);

    const subjectAttendance = attendance.filter(a => a.batchId === selectedBatch && a.subjectId === selectedSubject);
    
    return batchStudents.map(student => {
      const studentRecords = subjectAttendance.map(a => ({
        date: a.date,
        status: a.records[student.id] || '-'
      }));
      
      const presentCount = studentRecords.filter(r => r.status === 'Present').length;
      const totalCount = studentRecords.length;
      const rate = totalCount > 0 ? (presentCount / totalCount * 100).toFixed(1) : 0;

      return {
        ...student,
        records: studentRecords,
        presentCount,
        totalCount,
        rate
      };
    });
  }, [activeTab, selectedBatch, selectedSubject, attendance, enrollments, students]);

  // Filter students for current batch when in 'mark' mode
  const currentBatchStudents = useMemo(() => {
    return enrollments
      .filter(e => e.batchId === selectedBatch)
      .map(e => students.find(s => s.id === e.studentId))
      .filter(Boolean);
  }, [selectedBatch, enrollments, students]);

  // Initialize records when switching to mark mode
  React.useEffect(() => {
    if (activeTab === 'mark') {
      const existing = attendance.find(a => a.batchId === selectedBatch && a.date === markDate && a.subjectId === selectedSubject);
      if (existing) {
        setCurrentRecords(existing.records);
      } else {
        const init = {};
        currentBatchStudents.forEach(s => init[s.id] = 'Present');
        setCurrentRecords(init);
      }
    }
  }, [activeTab, selectedBatch, markDate, selectedSubject, attendance, currentBatchStudents]);

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleGuide 
        role={currentUser?.role}
        adminText="Track student attendance, generate reports, and identify students with low attendance."
        staffText="Mark student attendance and view attendance history."
        studentText="View your personal attendance history and overall attendance rate."
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Attendance Tracking</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage and monitor student attendance across subjects and batches.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
           {selectedStudentId && (
               <button 
                 onClick={() => setSelectedStudentId(null)}
                 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem' }}
               >
                 &larr; Back to List
               </button>
           )}
           <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem' }}>
             <Download size={16} /> Export
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => { setActiveTab('summary'); setSelectedStudentId(null); }}
          style={{ background: 'none', border: 'none', color: activeTab === 'summary' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'summary' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem', borderBottom: activeTab === 'summary' ? '2px solid var(--primary)' : 'none' }}
        >Summary</button>
        {(currentUser?.role === 'Admin' || currentUser?.role === 'Faculty') && (
          <button 
            onClick={() => { setActiveTab('mark'); setSelectedStudentId(null); }}
            style={{ background: 'none', border: 'none', color: activeTab === 'mark' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'mark' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem', borderBottom: activeTab === 'mark' ? '2px solid var(--primary)' : 'none' }}
          >Mark Attendance</button>
        )}
        <button 
          onClick={() => { setActiveTab('yearly'); setSelectedStudentId(null); }}
          style={{ background: 'none', border: 'none', color: activeTab === 'yearly' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'yearly' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem', borderBottom: activeTab === 'yearly' ? '2px solid var(--primary)' : 'none' }}
        >Yearly Report</button>
        {['Admin', 'Management', 'Office Staff'].includes(currentUser?.role) && (
          <button 
            onClick={() => { setActiveTab('staff'); setSelectedStudentId(null); }}
            style={{ background: 'none', border: 'none', color: activeTab === 'staff' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'staff' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem', borderBottom: activeTab === 'staff' ? '2px solid var(--primary)' : 'none' }}
          >Staff & Faculty Attendance</button>
        )}
      </div>

      {activeTab === 'summary' && !selectedStudentId && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <Card style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Students</p>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{stats.totalStudents}</h2>
                </div>
                <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '0.75rem', color: '#3b82f6' }}><Users size={24} /></div>
              </div>
            </Card>
            <Card style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Today's Rate</p>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{stats.todayRate}%</h2>
                </div>
                <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '0.75rem', color: '#10b981' }}><UserCheck size={24} /></div>
              </div>
            </Card>
            <Card style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Avg. Attendance</p>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{stats.averageAttendance}%</h2>
                </div>
                <div style={{ background: '#f5f3ff', padding: '0.75rem', borderRadius: '0.75rem', color: '#8b5cf6' }}><TrendingUp size={24} /></div>
              </div>
            </Card>
            <Card style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Low Attendance</p>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{stats.lowAttendanceCount}</h2>
                </div>
                <div style={{ background: '#fffbeb', padding: '0.75rem', borderRadius: '0.75rem', color: '#f59e0b' }}><AlertTriangle size={24} /></div>
              </div>
            </Card>
          </div>

          <Card style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Attendance Summary</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* View type pills */}
                {['Students', 'Faculty', 'Staff'].map(type => (
                  <button key={type} onClick={() => setFilterViewType(type)}
                    style={{ padding: '0.35rem 0.875rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: filterViewType === type ? 'var(--primary)' : 'var(--bg-base)', color: filterViewType === type ? 'white' : 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', fontSize: '0.8125rem', transition: 'all 0.2s' }}
                  >{type}</button>
                ))}
                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
                <button onClick={() => setShowFilters(f => !f)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: showFilters ? 'var(--primary-light)' : 'var(--bg-base)', color: showFilters ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  <Filter size={14} /> Filters {(filterDept !== 'All' || filterCourse !== 'All' || filterSubject !== 'All' || filterYear !== 'All' || filterThreshold > 0 || filterSearch) && <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>!</span>}
                </button>
              </div>
            </div>

            {showFilters && (
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Row 1: Search + Reset */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <Filter size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input type="text" placeholder="Search student name or ID…" value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                    />
                  </div>
                  <button onClick={() => { setFilterSearch(''); setFilterDept('All'); setFilterYear('All'); setFilterCourse('All'); setFilterSubject('All'); setFilterThreshold(0); }}
                    style={{ padding: '0.55rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500 }}
                  >Clear All</button>
                </div>

                {/* Row 2: dropdowns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Course</label>
                    <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      <option value="All">All Courses</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subject</label>
                    <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      <option value="All">All Subjects</option>
                      {subjects.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department</label>
                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {uniqueDepts.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Year</label>
                    <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {uniqueYears.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Below % (Low Attendance)</label>
                    <select value={filterThreshold} onChange={e => setFilterThreshold(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      <option value={0}>Show All</option>
                      <option value={75}>Below 75%</option>
                      <option value={60}>Below 60%</option>
                      <option value={50}>Below 50%</option>
                      <option value={40}>Below 40%</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', paddingTop: '0.25rem', borderTop: '1px solid var(--border-light)' }}>
                  Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredSummaryStudents.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{students.length}</strong> students
                  {filterSubject !== 'All' && <span> • Subject: <strong style={{ color: 'var(--primary)' }}>{subjects.find(s => s.code === filterSubject)?.name}</strong></span>}
                  {filterCourse !== 'All' && <span> • Course: <strong style={{ color: 'var(--primary)' }}>{courses.find(c => c.id === filterCourse)?.title}</strong></span>}
                </div>
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem' }}>User / Student</th>
                  <th style={{ padding: '1rem' }}>Department</th>
                  <th style={{ padding: '1rem' }}>Year</th>
                  <th style={{ padding: '1rem' }}>Attendance Rate</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filterViewType === 'Students' && filteredSummaryStudents.map(student => {
                  const studentAtd = filterSubject !== 'All'
                    ? attendance.filter(a => a.subjectId === filterSubject && a.records[student.id])
                    : attendance.filter(a => a.records[student.id]);
                  const total = studentAtd.length;
                  const present = studentAtd.filter(a => a.records[student.id] === 'Present').length;
                  const rate = total > 0 ? (present / total * 100).toFixed(0) : 0;
                  const rateN = Number(rate);
                  const rateColor = rateN >= 90 ? '#10b981' : rateN >= 75 ? '#3b82f6' : rateN >= 60 ? '#f59e0b' : '#ef4444';
                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{student.id}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{student.department}</td>
                      <td style={{ padding: '1rem' }}>{student.year}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 600, minWidth: '40px', color: rateColor }}>{rate}%</span>
                          <div style={{ flex: 1, height: '6px', background: 'var(--surface-hover)', borderRadius: '3px', overflow: 'hidden', minWidth: '100px' }}>
                            <div style={{ height: '100%', background: rateColor, width: `${rate}%`, transition: 'width 0.4s' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{present}/{total} sessions</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => setSelectedStudentId(student.id)}
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '0.4rem', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                        >View Details</button>
                      </td>
                    </tr>
                  );
                })}

                {filterViewType === 'Faculty' && faculty.map(member => {
                  const recs = staffAttendance.filter(a => a.memberId === member.id);
                  const total = recs.length;
                  const present = recs.filter(r => r.status === 'Present').length;
                  const rate = total > 0 ? (present / total * 100).toFixed(0) : 'N/A';
                  return (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}><div style={{ fontWeight: 600 }}>{member.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{member.id}</div></td>
                      <td style={{ padding: '1rem' }}>{member.department}</td>
                      <td style={{ padding: '1rem' }}><span style={{ padding: '0.2rem 0.6rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600 }}>{member.role}</span></td>
                      <td style={{ padding: '1rem' }}>
                        {rate === 'N/A' ? <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>No data</span> : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 600, minWidth: '40px', color: Number(rate) >= 75 ? '#10b981' : '#f59e0b' }}>{rate}%</span>
                            <div style={{ flex: 1, height: '6px', background: 'var(--surface-hover)', borderRadius: '3px', overflow: 'hidden', minWidth: '100px' }}><div style={{ height: '100%', background: Number(rate) >= 75 ? '#10b981' : '#f59e0b', width: `${rate}%` }}></div></div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{present}/{total} days</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}><span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>—</span></td>
                    </tr>
                  );
                })}

                {filterViewType === 'Staff' && staff.map(member => {
                  const recs = staffAttendance.filter(a => a.memberId === member.id);
                  const total = recs.length;
                  const present = recs.filter(r => r.status === 'Present').length;
                  const rate = total > 0 ? (present / total * 100).toFixed(0) : 'N/A';
                  return (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}><div style={{ fontWeight: 600 }}>{member.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{member.id}</div></td>
                      <td style={{ padding: '1rem' }}>{member.department}</td>
                      <td style={{ padding: '1rem' }}><span style={{ padding: '0.2rem 0.6rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600 }}>{member.role}</span></td>
                      <td style={{ padding: '1rem' }}>
                        {rate === 'N/A' ? <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>No data</span> : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 600, minWidth: '40px', color: Number(rate) >= 75 ? '#10b981' : '#f59e0b' }}>{rate}%</span>
                            <div style={{ flex: 1, height: '6px', background: 'var(--surface-hover)', borderRadius: '3px', overflow: 'hidden', minWidth: '100px' }}><div style={{ height: '100%', background: Number(rate) >= 75 ? '#10b981' : '#f59e0b', width: `${rate}%` }}></div></div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{present}/{total} days</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}><span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>—</span></td>
                    </tr>
                  );
                })}

                {(
                  (filterViewType === 'Students' && filteredSummaryStudents.length === 0) ||
                  (filterViewType === 'Faculty' && faculty.length === 0) ||
                  (filterViewType === 'Staff' && staff.length === 0)
                ) && (
                  <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No records match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {activeTab === 'summary' && selectedStudentId && selectedStudentData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                  <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'center' }}>
                          <div style={{ width: '80px', height: '80px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, margin: '0 auto 1rem auto' }}>
                              {selectedStudentData.name.charAt(0)}
                          </div>
                          <h2 style={{ margin: 0 }}>{selectedStudentData.name}</h2>
                          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>{selectedStudentData.id} | {selectedStudentData.rollNo}</p>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'var(--surface-hover)', fontSize: '0.875rem', fontWeight: 600 }}>{selectedStudentData.department}</span>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Overall Attendance</span>
                              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedStudentData.rate}%</span>
                          </div>
                          <div style={{ height: '10px', background: 'var(--surface-hover)', borderRadius: '5px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: 'var(--primary)', width: `${selectedStudentData.rate}%` }}></div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                              <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedStudentData.presentSessions}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Present</div>
                              </div>
                              <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedStudentData.totalSessions - selectedStudentData.presentSessions}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Absent</div>
                              </div>
                          </div>
                      </div>
                  </Card>

                  <Card style={{ padding: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1.5rem 0' }}>Subject-wise Attendance</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          {selectedStudentData.subjectBreakdown.map(sub => (
                              <div key={sub.code} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
                                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{sub.name}</div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: sub.rate > 75 ? '#10b981' : '#f59e0b' }}>{sub.rate}%</span>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub.present}/{sub.total} sessions</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </Card>
              </div>

              <Card style={{ padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0' }}>Detailed Attendance History</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                              <th style={{ padding: '1rem' }}>Date</th>
                              <th style={{ padding: '1rem' }}>Subject</th>
                              <th style={{ padding: '1rem' }}>Batch</th>
                              <th style={{ padding: '1rem' }}>Status</th>
                          </tr>
                      </thead>
                      <tbody>
                          {selectedStudentData.history.map(record => (
                              <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '1rem' }}>{record.date}</td>
                                  <td style={{ padding: '1rem' }}>{subjects.find(s => s.code === record.subjectId)?.name || record.subjectId}</td>
                                  <td style={{ padding: '1rem' }}>{batches.find(b => b.id === record.batchId)?.name || record.batchId}</td>
                                  <td style={{ padding: '1rem' }}>
                                      <span style={{ 
                                          padding: '0.25rem 0.75rem', 
                                          borderRadius: '1rem', 
                                          fontSize: '0.75rem', 
                                          fontWeight: 600,
                                          background: record.records[selectedStudentId] === 'Present' ? '#ecfdf5' : record.records[selectedStudentId] === 'Absent' ? '#fef2f2' : '#fffbeb',
                                          color: record.records[selectedStudentId] === 'Present' ? '#10b981' : record.records[selectedStudentId] === 'Absent' ? '#ef4444' : '#f59e0b'
                                      }}>
                                          {record.records[selectedStudentId]}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                          {selectedStudentData.history.length === 0 && (
                              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance history found.</td></tr>
                          )}
                      </tbody>
                  </table>
              </Card>
          </div>
      )}

      {activeTab === 'mark' && (
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem', background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Batch</label>
              <select 
                value={selectedBatch} 
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              >
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Subject</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              >
                {subjects.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Date</label>
              <input 
                type="date" 
                value={markDate} 
                onChange={(e) => setMarkDate(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
               <button onClick={handleMarkAttendance} style={{ width: '100%', padding: '0.6rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontWeight: 600 }}>Save Attendance</button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem' }}>Student Name</th>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentBatchStudents.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{student.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{student.id}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => setCurrentRecords({...currentRecords, [student.id]: 'Present'})}
                        style={{ padding: '0.4rem 1rem', borderRadius: '1.5rem', border: '1px solid', borderColor: currentRecords[student.id] === 'Present' ? '#10b981' : 'var(--border-color)', background: currentRecords[student.id] === 'Present' ? '#ecfdf5' : 'transparent', color: currentRecords[student.id] === 'Present' ? '#10b981' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
                      >
                        <CheckCircle size={14} /> Present
                      </button>
                      <button 
                        onClick={() => setCurrentRecords({...currentRecords, [student.id]: 'Absent'})}
                        style={{ padding: '0.4rem 1rem', borderRadius: '1.5rem', border: '1px solid', borderColor: currentRecords[student.id] === 'Absent' ? '#ef4444' : 'var(--border-color)', background: currentRecords[student.id] === 'Absent' ? '#fef2f2' : 'transparent', color: currentRecords[student.id] === 'Absent' ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
                      >
                        <XCircle size={14} /> Absent
                      </button>
                      <button 
                        onClick={() => setCurrentRecords({...currentRecords, [student.id]: 'Late'})}
                        style={{ padding: '0.4rem 1rem', borderRadius: '1.5rem', border: '1px solid', borderColor: currentRecords[student.id] === 'Late' ? '#f59e0b' : 'var(--border-color)', background: currentRecords[student.id] === 'Late' ? '#fffbeb' : 'transparent', color: currentRecords[student.id] === 'Late' ? '#f59e0b' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
                      >
                        <Clock size={14} /> Late
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentBatchStudents.length === 0 && (
                <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found in this batch.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'yearly' && (
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
             <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Batch</label>
              <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }}>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Subject</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }}>
                {subjects.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '0.4rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
               <Filter size={16} /> Apply Filters
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem', minWidth: '180px' }}>Student Name</th>
                  <th style={{ padding: '1rem' }}>Total Sessions</th>
                  <th style={{ padding: '1rem' }}>Present</th>
                  <th style={{ padding: '1rem' }}>Attendance %</th>
                  {/* We could add dates as columns here if needed, but for yearly a summary per subject is better */}
                  <th style={{ padding: '1rem' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.id}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{item.totalCount}</td>
                    <td style={{ padding: '1rem' }}>{item.presentCount}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 700, color: item.rate > 80 ? '#10b981' : item.rate > 60 ? '#f59e0b' : '#ef4444' }}>
                        {item.rate}%
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '20px' }}>
                        {item.records.slice(-10).map((r, i) => (
                          <div 
                            key={i} 
                            style={{ width: '4px', height: r.status === 'Present' ? '100%' : '30%', background: r.status === 'Present' ? '#10b981' : r.status === 'Absent' ? '#ef4444' : '#f59e0b', borderRadius: '1px' }}
                            title={`${r.date}: ${r.status}`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {yearlyData.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No data available for the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Staff & Faculty Attendance Tab ── */}
      {activeTab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Date</label>
                <input 
                  type="date" 
                  value={staffDate} 
                  onChange={e => setStaffDate(e.target.value)}
                  style={{ padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Member Type</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setStaffMemberType('faculty')} 
                    style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: staffMemberType === 'faculty' ? 'var(--primary)' : 'var(--bg-base)', color: staffMemberType === 'faculty' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.875rem' }}
                  >Faculty</button>
                  <button 
                    onClick={() => setStaffMemberType('staff')} 
                    style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: staffMemberType === 'staff' ? 'var(--primary)' : 'var(--bg-base)', color: staffMemberType === 'staff' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.875rem' }}
                  >Staff</button>
                </div>
              </div>
            </div>
          </Card>

          {/* Attendance Table */}
          <Card style={{ padding: '0' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                {staffMemberType === 'faculty' ? 'Faculty' : 'Staff'} Attendance — {staffDate}
              </h3>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {(() => {
                  const members = staffMemberType === 'faculty' ? faculty : staff;
                  const todayPresent = members.filter(m => {
                    const rec = staffAttendance.find(a => a.memberId === m.id && a.date === staffDate);
                    return rec?.status === 'Present';
                  }).length;
                  return `${todayPresent} / ${members.length} Present`;
                })()}
              </span>
            </div>
            <div className="table-responsive" style={{ margin: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                    <th style={{ padding: '0.875rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.875rem 1rem' }}>ID</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Department</th>
                    <th style={{ padding: '0.875rem 1rem' }}><LogIn size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }}/>Entry Time</th>
                    <th style={{ padding: '0.875rem 1rem' }}><LogOut size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }}/>Exit Time</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(staffMemberType === 'faculty' ? faculty : staff).map(member => {
                    const existing = staffAttendance.find(a => a.memberId === member.id && a.date === staffDate);
                    const isEditing = editingRow === member.id;

                    return (
                      <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row-hover">
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</td>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{member.id}</td>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{member.department}</td>

                        {isEditing ? (
                          <>
                            <td style={{ padding: '0.5rem 1rem' }}>
                              <input 
                                type="time" 
                                value={entryForm.entryTime} 
                                onChange={e => setEntryForm(f => ({ ...f, entryTime: e.target.value }))}
                                style={{ padding: '0.4rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--primary)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 1rem' }}>
                              <input 
                                type="time" 
                                value={entryForm.exitTime} 
                                onChange={e => setEntryForm(f => ({ ...f, exitTime: e.target.value }))}
                                style={{ padding: '0.4rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--primary)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 1rem' }}>
                              <select 
                                value={entryForm.status} 
                                onChange={e => setEntryForm(f => ({ ...f, status: e.target.value }))}
                                style={{ padding: '0.4rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--primary)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%' }}
                              >
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Late">Late</option>
                                <option value="Half Day">Half Day</option>
                                <option value="On Leave">On Leave</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                              <button 
                                onClick={() => {
                                  markStaffAttendance(member.id, staffMemberType, staffDate, entryForm.entryTime, entryForm.exitTime, entryForm.status);
                                  setEditingRow(null);
                                }}
                                style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}
                              >
                                <Save size={14} /> Save
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)', fontWeight: existing?.entryTime ? 600 : 400 }}>
                              {existing?.entryTime 
                                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}><LogIn size={14} />{existing.entryTime}</span> 
                                : <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>— Not marked —</span>}
                            </td>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              {existing?.exitTime 
                                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444' }}><LogOut size={14} />{existing.exitTime}</span> 
                                : <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>—</span>}
                            </td>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              {existing ? (
                                <span style={{ 
                                  padding: '0.25rem 0.65rem', 
                                  borderRadius: '2rem', 
                                  fontSize: '0.75rem', 
                                  fontWeight: 600,
                                  background: existing.status === 'Present' ? 'rgba(16,185,129,0.15)' : existing.status === 'Late' ? 'rgba(245,158,11,0.15)' : existing.status === 'Half Day' ? 'rgba(99,102,241,0.15)' : 'rgba(239,68,68,0.15)',
                                  color: existing.status === 'Present' ? '#10b981' : existing.status === 'Late' ? '#f59e0b' : existing.status === 'Half Day' ? '#6366f1' : '#ef4444'
                                }}>
                                  {existing.status}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                              <button 
                                onClick={() => {
                                  setEditingRow(member.id);
                                  setEntryForm({ 
                                    entryTime: existing?.entryTime || '', 
                                    exitTime: existing?.exitTime || '', 
                                    status: existing?.status || 'Present' 
                                  });
                                }}
                                style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', transition: 'all 0.2s' }}
                              >
                                <Edit2 size={13} /> {existing ? 'Edit' : 'Log Entry'}
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;
