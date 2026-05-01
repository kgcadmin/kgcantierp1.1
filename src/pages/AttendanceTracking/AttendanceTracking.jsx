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
  AlertTriangle
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
    courses
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'mark' | 'yearly'
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.code || '');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentRecords, setCurrentRecords] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState(null);

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
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Overall Attendance Summary</h3>
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
                {students.map(student => {
                  // Calculate actual rate for the list
                  const studentAttendance = attendance.filter(a => a.records[student.id]);
                  const total = studentAttendance.length;
                  const present = studentAttendance.filter(a => a.records[student.id] === 'Present').length;
                  const rate = total > 0 ? (present / total * 100).toFixed(0) : 0;
                  
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
                          <span style={{ fontWeight: 600, minWidth: '40px' }}>{rate}%</span>
                          <div style={{ flex: 1, height: '6px', background: 'var(--surface-hover)', borderRadius: '3px', overflow: 'hidden', minWidth: '100px' }}>
                            <div style={{ height: '100%', background: rate > 90 ? '#10b981' : rate > 75 ? '#3b82f6' : '#f59e0b', width: `${rate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          onClick={() => setSelectedStudentId(student.id)}
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '0.4rem', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
};

export default AttendanceTracking;
