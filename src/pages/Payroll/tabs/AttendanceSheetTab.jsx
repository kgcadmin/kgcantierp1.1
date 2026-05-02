import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

const cellInput = {
  border: '1px solid #e2e8f0',
  borderRadius: '4px',
  padding: '3px 6px',
  background: '#ffffff',
  color: '#0f172a',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
};

const AttendanceSheetTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, markStaffAttendance, calendar, editFaculty, editStaff } = useContext(AppContext);

  const allStaff = useMemo(() => [...faculty, ...staff], [faculty, staff]);

  const daysInMonth = useMemo(() =>
    new Date(selectedYear, selectedMonth + 1, 0).getDate(),
    [selectedMonth, selectedYear]);

  const dates = useMemo(() =>
    Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]);

  const monthName = useMemo(() =>
    new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }),
    [selectedMonth, selectedYear]);

  const getDayName = (day) =>
    new Date(selectedYear, selectedMonth, day).toLocaleString('default', { weekday: 'short' }).toUpperCase();

  const getStatus = (memberId, day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(selectedYear, selectedMonth, day).getDay();
    const record = staffAttendance.find(a => a.memberId === memberId && a.date === dateStr);
    if (record?.status) return record.status;
    if (dayOfWeek === 0) return 'SUN';
    const holiday = calendar.find(c => c.date === dateStr && (c.type === 'Holiday' || c.category === 'Holiday'));
    if (holiday) return 'H';
    return 'P';
  };

  const handleCellClick = (member, day) => {
    const currentStatus = getStatus(member.id, day);
    const statuses = ['P', 'A', 'CL', 'OT', 'H', 'SUN', ''];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
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
      const s = getStatus(memberId, day);
      if (s in counts) counts[s]++;
    });
    counts.TotalPresent = counts.P + counts.SUN + counts.H + counts.CL;
    return counts;
  };

  return (
    <div className={styles.salaryPrintArea}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 className={styles.headerTitle} style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>KASHIBAI GANPAT COLLEGE</h1>
        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>VILL - CHAKME, (THAKUR GAON) BURMU, RANCHI- 835205</p>
        <h3 style={{ margin: '1rem 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
          ATTENDANCE SHEET — {monthName.toUpperCase()} {selectedYear}
        </h3>
      </div>

      {/* Sub-header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #cbd5e1', borderBottom: 'none', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
        <span>MONTH :- {monthName.toUpperCase()}</span>
        <span>01-{monthName.toUpperCase()} TO {daysInMonth}-{monthName.toUpperCase()}</span>
        <span>STAFF ATTENDANCE REGISTER — {selectedYear}</span>
      </div>

      {/* Table */}
      <div className={styles.scrollWrapper}>
        <table className={styles.slipTable}>
          <thead>
            <tr>
              <th rowSpan="2" style={{ background: '#f8fafc', width: '150px' }}>NAME</th>
              <th rowSpan="2" style={{ background: '#f8fafc', width: '100px' }}>DESIGNATION</th>
              {dates.map(d => (
                <th key={d} style={{ background: '#1e293b', color: '#fff', width: '24px' }}>{d}</th>
              ))}
              <th rowSpan="2" className={styles.verticalHeader} style={{ background: '#f1f5f9' }}>Summer Vacation</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ background: '#fee2e2', color: '#991b1b' }}>Absent</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ background: '#ffedd5', color: '#9a3412' }}>Sunday / Holiday</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ background: '#dcfce7', color: '#166534' }}>CL</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ background: '#e0e7ff', color: '#3730a3' }}>Present</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ background: '#e0e7ff', color: '#3730a3' }}>Holiday / Present</th>
            </tr>
            <tr>
              {dates.map(d => (
                <th key={d} style={{ background: '#475569', color: '#fff', fontSize: '0.55rem', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{getDayName(d)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allStaff.map(s => {
              const counts = calculateCounts(s.id);
              return (
                <tr key={s.id}>
                  {/* Editable Name */}
                  <td className={styles.nameCol}>
                    <input type="text" value={s.name} onChange={e => updateProfile(s.id, 'name', e.target.value)}
                      style={{ ...cellInput, fontWeight: 700, fontSize: '0.75rem' }} />
                  </td>
                  {/* Editable Designation */}
                  <td>
                    <input type="text" value={s.role || s.designation || 'Staff'} onChange={e => updateProfile(s.id, 'role', e.target.value)}
                      style={{ ...cellInput, textAlign: 'center', fontSize: '0.7rem' }} />
                  </td>
                  {/* Attendance cells — click to toggle */}
                  {dates.map(d => {
                    const status = getStatus(s.id, d);
                    const cls = status ? styles[`att${status}`] : styles.attEmpty;
                    return (
                      <td key={d} onClick={() => handleCellClick(s, d)} className={`${styles.attCell} ${cls}`} title="Click to change">
                        {status}
                      </td>
                    );
                  })}
                  {/* Summary columns */}
                  <td></td>
                  <td style={{ fontWeight: 700, color: counts.A > 0 ? '#ef4444' : 'inherit' }}>{counts.A || ''}</td>
                  <td style={{ fontWeight: 700 }}>{(counts.SUN + counts.H) || ''}</td>
                  <td style={{ fontWeight: 700 }}>{counts.CL || ''}</td>
                  <td style={{ fontWeight: 700 }}>{counts.P || ''}</td>
                  <td style={{ fontWeight: 700, background: '#f8fafc' }}>{counts.TotalPresent || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ marginTop: '1.5rem' }}>
        <table className={styles.slipTable} style={{ width: '220px' }}>
          <thead>
            <tr><th colSpan="2" style={{ background: '#f1f5f9', textAlign: 'left', paddingLeft: '8px' }}>NOTE / LEGEND</th></tr>
          </thead>
          <tbody>
            <tr><td className={styles.attP} style={{ width: '100px' }}>PRESENT</td><td className={styles.attP} style={{ fontWeight: 700 }}>P</td></tr>
            <tr><td className={styles.attA}>ABSENT</td><td className={styles.attA} style={{ fontWeight: 700 }}>A</td></tr>
            <tr><td className={styles.attSUN}>SUNDAY</td><td className={styles.attSUN} style={{ fontWeight: 700 }}>SUN</td></tr>
            <tr><td className={styles.attCL}>CASUAL LEAVE</td><td className={styles.attCL} style={{ fontWeight: 700 }}>CL</td></tr>
            <tr><td className={styles.attH}>HOLIDAY</td><td className={styles.attH} style={{ fontWeight: 700 }}>H</td></tr>
            <tr><td className={styles.attOT}>OVER TIME</td><td className={styles.attOT} style={{ fontWeight: 700 }}>OT</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSheetTab;
