import React, { useContext, useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Users, CalendarDays, Bookmark, Settings, Edit2, List, Grid, Layers, Trash2 } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';

const Timetable = () => {
  const { timetable, attendance, courses, faculty, addTimetable, generateTimetable, calendar, editCalendarEvent, addCalendarEvent, deleteCalendarEvent, exams, communication, batches, updateBatch, editTimetableSlot, bulkReplaceTimetable, markAttendance, enrollments, students, currentUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('schedule');
  
  const initialBatch = currentUser?.role === 'Student' 
    ? enrollments.find(e => e.studentId === currentUser.linkedId)?.batchId || batches[0]?.id 
    : currentUser?.role === 'Faculty'
    ? batches.find(b => b.facultyId === currentUser.linkedId)?.id || batches[0]?.id
    : batches[0]?.id || '';
    
  const [activeBatch, setActiveBatch] = useState(initialBatch);
  const [calendarView, setCalendarView] = useState('list'); // 'list', 'monthly', 'yearly'
  const [showSettings, setShowSettings] = useState(false);
  const [modalEvents, setModalEvents] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);

  // Attendance specific states
  const [attendanceMode, setAttendanceMode] = useState('overview'); // 'overview' | 'mark'
  const [markDate, setMarkDate] = useState('2026-04-21');
  const [markBatch, setMarkBatch] = useState(batches[0]?.id || '');
  const [currentRecords, setCurrentRecords] = useState({});

  React.useEffect(() => {
    if (activeTab === 'attendance' && attendanceMode === 'mark') {
      const existing = attendance.find(a => a.batchId === markBatch && a.date === markDate);
      if (existing && existing.records) {
        setCurrentRecords(existing.records);
      } else {
        const batchStudents = enrollments.filter(e => e.batchId === markBatch).map(e => e.studentId);
        const initRecs = {};
        batchStudents.forEach(id => initRecs[id] = 'Present'); // Default to Present
        setCurrentRecords(initRecs);
      }
    }
  }, [markBatch, markDate, attendanceMode, activeTab, attendance, enrollments]);

  const getCourseTitle = (id) => courses.find(c => c.id === id)?.title || id;
  const getFacultyName = (id) => faculty.find(f => f.id === id)?.name || id;

  const filteredTimetable = timetable.filter(t => t.batchId === activeBatch);
  const selectedBatchObj = batches.find(b => b.id === activeBatch);

  const getBatchConfig = () => {
    return selectedBatchObj?.timetableConfig || { startTime: '09:00', durationMinutes: 90, periodsPerDay: 3, days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] };
  };

  const getTimeSlots = () => {
    const config = getBatchConfig();
    let times = [];
    let [hours, minutes] = config.startTime.split(':').map(Number);
    let currentTime = new Date(2000, 0, 1, hours, minutes);

    for (let i = 0; i < config.periodsPerDay; i++) {
      const startStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      currentTime.setMinutes(currentTime.getMinutes() + config.durationMinutes);
      const endStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      times.push(`${startStr} - ${endStr}`);
    }
    return times;
  };

  const getCombinedCalendarEvents = useMemo(() => {
    // 1. Base Academic Calendar
    const allEvents = [...calendar];
    
    // 2. Add Exams
    exams.forEach(exam => {
      allEvents.push({
        id: exam.id,
        title: exam.title,
        date: exam.date,
        type: 'Exam',
        description: `${exam.type} Exam for course ${getCourseTitle(exam.courseId)}`,
        readOnly: true
      });
    });

    // 3. Add Notices/Announcements
    communication.notices.forEach(notice => {
      allEvents.push({
        id: notice.id,
        title: notice.title,
        date: notice.date,
        type: notice.type === 'Holiday' ? 'Holiday' : 'Academic',
        description: `Announcement to: ${notice.audience}`,
        readOnly: true
      });
    });

    // Sort by date ascending
    return allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [calendar, exams, communication, courses]);

  const handleScheduleSpecific = (day, time) => {
    if (!activeBatch) { alert("Please select a batch first."); return; }
    const courseId = window.prompt("Enter Course ID (e.g., CRS01):", selectedBatchObj?.courseId || '');
    const subject = window.prompt("Enter Subject Code (e.g., CS101):");
    const facultyId = window.prompt("Enter Faculty ID (e.g., FAC001):");
    const room = window.prompt("Enter Room (e.g., RM101):");
    
    if (courseId && subject && facultyId && room) {
      addTimetable({ batchId: activeBatch, day, time, courseId, subject, facultyId, room });
    }
  };

  const handleSchedule = () => {
    if (!activeBatch) { alert("Please select a batch first."); return; }
    
    const day = window.prompt("Enter Day (e.g., Monday):");
    const time = window.prompt("Enter Time (e.g., 09:00 AM - 10:30 AM):");
    // Default course to the batch's course
    const courseId = window.prompt("Enter Course ID (e.g., CRS01):", selectedBatchObj?.courseId || '');
    const subject = window.prompt("Enter Subject Code (e.g., CS101):");
    const facultyId = window.prompt("Enter Faculty ID (e.g., FAC001):");
    const room = window.prompt("Enter Room (e.g., RM101):");
    
    if (day && time && courseId && subject && facultyId && room) {
      addTimetable({ batchId: activeBatch, day, time, courseId, subject, facultyId, room });
    }
  };

  const handleGenerate = () => {
    if (!activeBatch) { alert("Please select a batch first."); return; }
    const maxClasses = window.prompt("Enter Max Classes Per Teacher Per Day (default: 2):", "2");
    if (maxClasses && !isNaN(maxClasses)) {
      if (window.confirm(`WARNING: This will overwrite the current timetable for ${selectedBatchObj?.name || 'this batch'}. Are you sure?`)) {
        generateTimetable(Number(maxClasses), activeBatch, selectedBatchObj?.courseId);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Timetable & Attendance</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Subject allocation, academic calendars, and attendance tracking.</p>
        </div>
        {activeTab === 'schedule' && currentUser?.role === 'Admin' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleGenerate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#388e3c', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <Settings size={18} /> Auto-Generate
            </button>
            <button onClick={handleSchedule} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <CalendarIcon size={18} /> Schedule Class
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('schedule')}
          style={{ background: 'none', border: 'none', color: activeTab === 'schedule' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'schedule' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem' }}
        ><CalendarDays size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> Class Schedule</button>
        
        <button 
          onClick={() => setActiveTab('attendance')}
          style={{ background: 'none', border: 'none', color: activeTab === 'attendance' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'attendance' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem' }}
        ><Users size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> Student Attendance</button>
        
        <button 
          onClick={() => setActiveTab('calendar')}
          style={{ background: 'none', border: 'none', color: activeTab === 'calendar' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'calendar' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem' }}
        ><Bookmark size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> Academic Calendar</button>
      </div>

      {activeTab === 'schedule' && (
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Class Timetable</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {currentUser?.role === 'Admin' && (
                <button onClick={() => setShowSettings(!showSettings)} style={{ background: showSettings ? 'var(--primary)' : 'var(--surface-hover)', color: showSettings ? 'white' : 'var(--text-primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={16} /> Config</button>
              )}
              <select 
                value={activeBatch} 
                onChange={(e) => setActiveBatch(e.target.value)}
                disabled={currentUser?.role === 'Student'}
                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)', opacity: currentUser?.role === 'Student' ? 0.7 : 1 }}
              >
                {batches.filter(b => currentUser?.role === 'Faculty' ? b.facultyId === currentUser.linkedId : true).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {showSettings && (
            <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Start Time</label>
                  <input type="time" value={getBatchConfig().startTime} onChange={(e) => updateBatch(activeBatch, { timetableConfig: { ...getBatchConfig(), startTime: e.target.value }})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Duration (mins)</label>
                  <input type="number" value={getBatchConfig().durationMinutes} onChange={(e) => updateBatch(activeBatch, { timetableConfig: { ...getBatchConfig(), durationMinutes: Number(e.target.value) }})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Periods Per Day</label>
                  <input type="number" value={getBatchConfig().periodsPerDay} onChange={(e) => updateBatch(activeBatch, { timetableConfig: { ...getBatchConfig(), periodsPerDay: Number(e.target.value) }})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                   <button onClick={handleGenerate} style={{ width: '100%', padding: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600 }}>Auto-Generate Schedule</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Working Days</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={getBatchConfig().days.includes(day)}
                        onChange={(e) => {
                          const currentDays = [...getBatchConfig().days];
                          if (e.target.checked) currentDays.push(day);
                          else currentDays.splice(currentDays.indexOf(day), 1);
                          // Preserve logical order
                          const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].filter(d => currentDays.includes(d));
                          updateBatch(activeBatch, { timetableConfig: { ...getBatchConfig(), days: orderedDays }});
                        }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bulk Replace Tool</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button onClick={() => {
                    const type = window.prompt("Replace 'faculty' or 'subject'?", "faculty");
                    if (type !== 'faculty' && type !== 'subject') return;
                    const oldVal = window.prompt(`Enter old ${type} ID/Code:`);
                    if (!oldVal) return;
                    const newVal = window.prompt(`Enter new ${type} ID/Code:`);
                    if (oldVal && newVal) bulkReplaceTimetable(activeBatch, type, oldVal, newVal);
                  }} style={{ padding: '0.5rem 1rem', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <Edit2 size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Replace Faculty/Subject
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Replaces all instances in the current active batch schedule.</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface-hover)', width: '120px' }}>Time / Day</th>
                  {getBatchConfig().days.map(d => <th key={d} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface-hover)' }}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {getTimeSlots().map(time => (
                  <tr key={time}>
                    <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{time}</td>
                    {getBatchConfig().days.map(day => {
                      const slot = filteredTimetable.find(t => t.day === day && t.time === time);
                      return (
                        <td key={day} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', height: '80px', verticalAlign: 'top', width: `${100 / getBatchConfig().days.length}%` }}>
                          {slot ? (
                            <div 
                              onClick={() => {
                                if (currentUser?.role === 'Student' || currentUser?.role === 'Faculty') return;
                                const subject = window.prompt("Edit Subject Code:", slot.subject);
                                if (!subject) return;
                                const facultyId = window.prompt("Edit Faculty ID:", slot.facultyId);
                                const room = window.prompt("Edit Room:", slot.room);
                                if (subject && facultyId && room) editTimetableSlot(slot.id, { subject, facultyId, room });
                              }}
                              style={{ background: 'var(--surface-hover)', padding: '0.5rem', borderRadius: '0.25rem', textAlign: 'left', borderLeft: '3px solid var(--primary)', cursor: (currentUser?.role === 'Student' || currentUser?.role === 'Faculty') ? 'default' : 'pointer', position: 'relative' }}
                              title={(currentUser?.role === 'Student' || currentUser?.role === 'Faculty') ? '' : "Click to Edit"}
                            >
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{slot.subject}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{getFacultyName(slot.facultyId)}</span>
                                <span style={{ fontWeight: 600 }}>{slot.room}</span>
                              </div>
                            </div>
                          ) : (
                            currentUser?.role === 'Admin' && (
                              <button onClick={() => handleScheduleSpecific(day, time)} style={{ border: '1px dashed var(--border-color)', background: 'transparent', width: '100%', height: '100%', minHeight: '60px', borderRadius: '0.25rem', color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>+ Add Class</button>
                            )
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Student Attendance</h2>
            {currentUser?.role !== 'Student' && (
              <div style={{ display: 'flex', background: 'var(--surface-hover)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                <button onClick={() => setAttendanceMode('overview')} style={{ background: attendanceMode === 'overview' ? 'var(--surface)' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: attendanceMode === 'overview' ? 600 : 500, color: attendanceMode === 'overview' ? 'var(--primary)' : 'var(--text-secondary)' }}>Overview</button>
                <button onClick={() => setAttendanceMode('mark')} style={{ background: attendanceMode === 'mark' ? 'var(--surface)' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: attendanceMode === 'mark' ? 600 : 500, color: attendanceMode === 'mark' ? 'var(--primary)' : 'var(--text-secondary)' }}>Mark Attendance</button>
              </div>
            )}
          </div>

          {currentUser?.role === 'Student' ? (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    <th style={{ padding: '0.75rem' }}>Date</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.filter(a => a.batchId === activeBatch).sort((a,b) => new Date(b.date) - new Date(a.date)).map(record => {
                    const status = record.records[currentUser.linkedId];
                    if (!status) return null;
                    return (
                      <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{record.date}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
                            background: status === 'Present' ? '#e8f5e9' : status === 'Absent' ? '#ffebee' : '#fff3e0',
                            color: status === 'Present' ? '#2e7d32' : status === 'Absent' ? '#c62828' : '#e65100'
                          }}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {attendance.filter(a => a.batchId === activeBatch && a.records[currentUser.linkedId]).length === 0 && (
                    <tr><td colSpan="2" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : attendanceMode === 'overview' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', background: 'var(--surface-hover)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                  <CalendarIcon size={16} /> Date: 2026-04-21
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    <th style={{ padding: '0.75rem' }}>Batch</th>
                    <th style={{ padding: '0.75rem' }}>Present</th>
                    <th style={{ padding: '0.75rem' }}>Absent</th>
                    <th style={{ padding: '0.75rem' }}>Late</th>
                    <th style={{ padding: '0.75rem' }}>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.filter(a => a.date === '2026-04-21').map((record) => {
                    let present = 0, absent = 0, late = 0;
                    Object.values(record.records || {}).forEach(status => {
                      if (status === 'Present') present++;
                      else if (status === 'Absent') absent++;
                      else if (status === 'Late') late++;
                    });
                    const total = present + absent + late;
                    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
                    return (
                      <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{batches.find(b => b.id === record.batchId)?.name || record.batchId}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#2e7d32', fontWeight: 600 }}>{present}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#d32f2f', fontWeight: 600 }}>{absent}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#f57c00', fontWeight: 600 }}>{late}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: 600, color: rate >= 85 ? '#2e7d32' : '#e65100' }}>{rate}%</span>
                            <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: rate >= 85 ? '#4caf50' : '#ff9800', width: `${rate}%` }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--surface-hover)', padding: '1rem', borderRadius: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Date</label>
                  <input type="date" value={markDate} onChange={(e) => setMarkDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Batch</label>
                  <select value={markBatch} onChange={(e) => setMarkBatch(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
                    {batches.filter(b => currentUser?.role === 'Faculty' ? b.facultyId === currentUser.linkedId : true).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <button onClick={() => {
                    markAttendance(markBatch, markDate, currentRecords);
                    alert("Attendance Saved Successfully!");
                  }} style={{ padding: '0.5rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600, height: '35px' }}>Save Attendance</button>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    <th style={{ padding: '0.75rem' }}>Student ID</th>
                    <th style={{ padding: '0.75rem' }}>Name</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.filter(e => e.batchId === markBatch).map(e => {
                    const student = students.find(s => s.id === e.studentId);
                    if (!student) return null;
                    const status = currentRecords[student.id] || 'Present';
                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{student.id}</td>
                        <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{student.name}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setCurrentRecords({...currentRecords, [student.id]: 'Present'})} style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: status === 'Present' ? 600 : 400, background: status === 'Present' ? '#e8f5e9' : 'transparent', color: status === 'Present' ? '#2e7d32' : 'var(--text-secondary)' }}>Present</button>
                            <button onClick={() => setCurrentRecords({...currentRecords, [student.id]: 'Absent'})} style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: status === 'Absent' ? 600 : 400, background: status === 'Absent' ? '#ffebee' : 'transparent', color: status === 'Absent' ? '#d32f2f' : 'var(--text-secondary)' }}>Absent</button>
                            <button onClick={() => setCurrentRecords({...currentRecords, [student.id]: 'Late'})} style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: status === 'Late' ? 600 : 400, background: status === 'Late' ? '#fff3e0' : 'transparent', color: status === 'Late' ? '#f57c00' : 'var(--text-secondary)' }}>Late</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {enrollments.filter(e => e.batchId === markBatch).length === 0 && (
                    <tr><td colSpan="3" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No students enrolled in this batch.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'calendar' && (
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Academic Calendar 2026-2027</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', background: 'var(--surface-hover)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                <button onClick={() => setCalendarView('list')} style={{ background: calendarView === 'list' ? 'var(--surface)' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: calendarView === 'list' ? 'var(--primary)' : 'var(--text-secondary)' }}><List size={16} /> List</button>
                <button onClick={() => setCalendarView('monthly')} style={{ background: calendarView === 'monthly' ? 'var(--surface)' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: calendarView === 'monthly' ? 'var(--primary)' : 'var(--text-secondary)' }}><Grid size={16} /> Monthly</button>
                <button onClick={() => setCalendarView('yearly')} style={{ background: calendarView === 'yearly' ? 'var(--surface)' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: calendarView === 'yearly' ? 'var(--primary)' : 'var(--text-secondary)' }}><Layers size={16} /> Yearly</button>
              </div>
              {currentUser?.role !== 'Student' && (
                <button 
                  onClick={() => setShowAddEvent(true)}
                  style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Add Event
                </button>
              )}
            </div>
          </div>

          {calendarView === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {getCombinedCalendarEvents.map(event => (
                <div key={event.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem', borderLeft: `4px solid ${event.type === 'Holiday' ? '#e65100' : event.type === 'Exam' ? '#d32f2f' : '#388e3c'}` }}>
                  <div style={{ minWidth: '100px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(event.date).getFullYear()}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{event.title}</h3>
                      <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '1rem', background: event.type === 'Holiday' ? '#fff3e0' : event.type === 'Exam' ? '#ffebee' : '#e8f5e9', color: event.type === 'Holiday' ? '#e65100' : event.type === 'Exam' ? '#c62828' : '#2e7d32', fontWeight: 600 }}>{event.type}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{event.description}</p>
                  </div>
                  {!event.readOnly && currentUser?.role !== 'Student' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => {
                          const newTitle = window.prompt("Edit Event Title:", event.title);
                          const newDate = window.prompt("Edit Start Date (YYYY-MM-DD):", event.date);
                          const newEndDate = window.prompt("Edit End Date (YYYY-MM-DD, optional):", event.endDate || '');
                          if (newTitle && newDate) {
                            editCalendarEvent(event.id, { title: newTitle, date: newDate, endDate: newEndDate || undefined });
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                        title="Edit Event"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this event?")) {
                            deleteCalendarEvent(event.id);
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', padding: '0.5rem' }}
                        title="Delete Event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {calendarView === 'monthly' && (
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--surface-hover)', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', padding: '1rem 0', fontSize: '0.875rem' }}>
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, auto)' }}>
                {Array.from({ length: 30 }).map((_, idx) => {
                  const currentDay = idx + 1;
                  const dateStr = `2026-04-${currentDay.toString().padStart(2, '0')}T00:00:00`;
                  const dObj = new Date(dateStr);
                  const dayEvents = getCombinedCalendarEvents.filter(e => {
                    const start = new Date(e.date + 'T00:00:00');
                    const end = e.endDate ? new Date(e.endDate + 'T00:00:00') : start;
                    return dObj >= start && dObj <= end;
                  });
                  return (
                    <div key={idx} style={{ borderTop: '1px solid var(--border-color)', borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-color)' : 'none', padding: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{currentDay}</span>
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {dayEvents.map(e => (
                          <div 
                            key={e.id} 
                            onClick={(ev) => { ev.stopPropagation(); setModalEvents([e]); }}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: e.type === 'Holiday' ? '#fff3e0' : e.type === 'Exam' ? '#ffebee' : '#e8f5e9', color: e.type === 'Holiday' ? '#e65100' : e.type === 'Exam' ? '#c62828' : '#2e7d32', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }} 
                            title="Click for details"
                          >
                            {e.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {calendarView === 'yearly' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, mIdx) => {
                const monthEvents = getCombinedCalendarEvents.filter(e => new Date(e.date).getMonth() === mIdx);
                return (
                  <div key={month} style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center', color: 'var(--text-primary)' }}>{month} 2026</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
                      {Array.from({ length: 30 }).map((_, dIdx) => {
                        const dateStr = `2026-${(mIdx + 1).toString().padStart(2, '0')}-${(dIdx + 1).toString().padStart(2, '0')}T00:00:00`;
                        const dObj = new Date(dateStr);
                        const dayEvents = monthEvents.filter(e => {
                          const start = new Date(e.date + 'T00:00:00');
                          const end = e.endDate ? new Date(e.endDate + 'T00:00:00') : start;
                          return dObj >= start && dObj <= end;
                        });
                        const hasEvent = dayEvents.length > 0;
                        return (
                          <div 
                            key={dIdx} 
                            onClick={() => { if (hasEvent) setModalEvents(dayEvents); }}
                            style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: hasEvent ? 'white' : 'var(--text-secondary)', background: hasEvent ? 'var(--primary)' : 'transparent', borderRadius: '50%', cursor: hasEvent ? 'pointer' : 'default' }} 
                            title={hasEvent ? 'Click to view events' : ''}
                          >
                            {dIdx + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {modalEvents && modalEvents.length > 0 && (
        <div 
          onClick={() => setModalEvents(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '0.75rem', width: '450px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Event Details</h2>
              <button 
                onClick={() => setModalEvents(null)} 
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.5rem', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                &times;
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {modalEvents.map(event => (
                <div key={event.id} style={{ padding: '1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem', borderLeft: `4px solid ${event.type === 'Holiday' ? '#e65100' : event.type === 'Exam' ? '#d32f2f' : '#388e3c'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{event.title}</h3>
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '1rem', background: event.type === 'Holiday' ? '#fff3e0' : event.type === 'Exam' ? '#ffebee' : '#e8f5e9', color: event.type === 'Holiday' ? '#e65100' : event.type === 'Exam' ? '#c62828' : '#2e7d32', fontWeight: 600 }}>{event.type}</span>
                      </div>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                        {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}`}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{event.description}</p>
                    </div>
                    {!event.readOnly && currentUser?.role !== 'Student' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => {
                            const newTitle = window.prompt("Edit Event Title:", event.title);
                            const newDate = window.prompt("Edit Start Date (YYYY-MM-DD):", event.date);
                            const newEndDate = window.prompt("Edit End Date (YYYY-MM-DD, optional):", event.endDate || '');
                            if (newTitle && newDate) {
                              const updated = { title: newTitle, date: newDate, endDate: newEndDate || undefined };
                              editCalendarEvent(event.id, updated);
                              setModalEvents(modalEvents.map(e => e.id === event.id ? { ...e, ...updated } : e));
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.25rem' }}
                          title="Edit Event"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this event?")) {
                              deleteCalendarEvent(event.id);
                              setModalEvents(modalEvents.filter(e => e.id !== event.id));
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', padding: '0.25rem' }}
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  {event.readOnly && <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>* System generated event (View only)</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddEvent && (
        <div 
          onClick={() => setShowAddEvent(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '0.75rem', width: '400px', maxWidth: '90%', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Add New Event</h2>
              <button onClick={() => setShowAddEvent(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.5rem', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>&times;</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addCalendarEvent({
                title: formData.get('title'),
                date: formData.get('date'),
                endDate: formData.get('endDate') || undefined,
                type: formData.get('type'),
                description: formData.get('description'),
                readOnly: false
              });
              setShowAddEvent(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'transparent', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Event Title</label>
                <input name="title" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Start Date</label>
                <input name="date" type="date" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>End Date (Optional)</label>
                <input name="endDate" type="date" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Type</label>
                <select name="type" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                  <option value="Academic">Academic</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Event">Event</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                <textarea name="description" rows="3" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-base)', color: 'var(--text-primary)', resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" style={{ padding: '0.875rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Save Event</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
