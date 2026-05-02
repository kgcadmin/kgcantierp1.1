import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

const AttendanceSheetTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, markStaffAttendance, calendar, editFaculty, editStaff } = useContext(AppContext);
  
  const allStaff = useMemo(() => [...faculty, ...staff], [faculty, staff]);
  
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const dates = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  const monthName = useMemo(() => {
    return new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });
  }, [selectedMonth, selectedYear]);

  const getDayName = (day) => {
    return new Date(selectedYear, selectedMonth, day).toLocaleString('default', { weekday: 'short' }).toUpperCase();
  };

  const getAttendanceRecord = (memberId, day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return staffAttendance.find(a => a.memberId === memberId && a.date === dateStr);
  };

  const getStatus = (memberId, day) => {
    const dayName = new Date(selectedYear, selectedMonth, day).getDay();
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const record = getAttendanceRecord(memberId, day);
    if (record?.status) return record.status;

    if (dayName === 0) return 'SUN';
    const holiday = calendar.find(c => c.date === dateStr && (c.type === 'Holiday' || c.category === 'Holiday'));
    if (holiday) return 'H';

    return 'P';
  };

  const handleCellClick = (member, day) => {
    const currentStatus = getStatus(member.id, day);
    const statuses = ['P', 'A', 'CL', 'OT', 'H', 'SUN', ''];
    let nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    markStaffAttendance(member.id, member.role === 'Faculty' ? 'Faculty' : 'Staff', dateStr, '', '', nextStatus);
  };

  const updateProfile = (id, field, value) => {
    const isFaculty = faculty.some(f => f.id === id);
    if (isFaculty) editFaculty(id, { [field]: value });
    else editStaff(id, { [field]: value });
  };

  const calculateCounts = (memberId) => {
    const counts = { P: 0, A: 0, SUN: 0, CL: 0, H: 0, OT: 0 };
    dates.forEach(day => {
      const status = getStatus(memberId, day);
      if (status === 'P') counts.P++;
      else if (status === 'A') counts.A++;
      else if (status === 'SUN') counts.SUN++;
      else if (status === 'CL') counts.CL++;
      else if (status === 'H') counts.H++;
      else if (status === 'OT') counts.OT++;
    });
    counts.TotalPresent = counts.P + counts.SUN + counts.H + counts.CL;
    return counts;
  };

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeader}>
        <h2 className={styles.reportTitle}>Attendance Register</h2>
        <p className={styles.reportSubtitle}>{monthName} {selectedYear} • Staff & Faculty Tracking</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.modernTable}>
          <thead>
            <tr>
              <th style={{ minWidth: '200px' }}>Employee Details</th>
              <th style={{ minWidth: '120px' }}>Role</th>
              {dates.map(d => (
                <th key={d} style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{getDayName(d).slice(0, 1)}</span>
                    <span style={{ fontSize: '0.9rem' }}>{d}</span>
                  </div>
                </th>
              ))}
              <th className={styles.calcCell} style={{ textAlign: 'center' }}>Absent</th>
              <th className={styles.calcCell} style={{ textAlign: 'center' }}>Sun/Hol</th>
              <th className={styles.calcCell} style={{ textAlign: 'center' }}>C.L.</th>
              <th className={styles.calcCell} style={{ textAlign: 'center' }}>Present</th>
              <th className={styles.netPayCell} style={{ textAlign: 'center' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map(s => {
              const counts = calculateCounts(s.id);
              return (
                <tr key={s.id}>
                  <td>
                    <input 
                      type="text" 
                      value={s.name} 
                      onChange={(e) => updateProfile(s.id, 'name', e.target.value)}
                      className={styles.editInput}
                      placeholder="Employee Name"
                      style={{ fontWeight: 600 }}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.role || s.designation || 'Staff'} 
                      onChange={(e) => updateProfile(s.id, 'role', e.target.value)}
                      className={styles.editInput}
                      placeholder="Designation"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </td>
                  {dates.map(d => {
                    const status = getStatus(s.id, d);
                    const statusClass = status ? styles[`status${status}`] : styles.statusEmpty;
                    return (
                      <td 
                        key={d} 
                        onClick={() => handleCellClick(s, d)}
                        className={`${styles.attCell} ${statusClass}`}
                        title={`Click to change status for ${s.name} on ${d} ${monthName}`}
                      >
                        {status || '-'}
                      </td>
                    );
                  })}
                  <td className={styles.calcCell} style={{ textAlign: 'center' }}>{counts.A}</td>
                  <td className={styles.calcCell} style={{ textAlign: 'center' }}>{counts.SUN + counts.H}</td>
                  <td className={styles.calcCell} style={{ textAlign: 'center' }}>{counts.CL}</td>
                  <td className={styles.calcCell} style={{ textAlign: 'center' }}>{counts.P}</td>
                  <td className={styles.netPayCell} style={{ textAlign: 'center' }}>{counts.TotalPresent}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.noPrint} style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Legend (Click cells to toggle):</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '4px' }} className={styles.statusP}></span> Present</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '4px' }} className={styles.statusA}></span> Absent</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '4px' }} className={styles.statusSUN}></span> Sunday</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '4px' }} className={styles.statusCL}></span> Casual Leave</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '4px' }} className={styles.statusH}></span> Holiday</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '4px' }} className={styles.statusOT}></span> Overtime</div>
      </div>
    </div>
  );
};

export default AttendanceSheetTab;
