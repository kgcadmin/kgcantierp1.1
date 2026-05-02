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
    <div className={styles.salaryPrintArea}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 className={styles.headerTitle} style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>KASHIBAI GANPAT COLLEGE</h1>
        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.5px' }}>VILL - CHAKME, (THAKUR GAON) BURMU, RANCHI- 835205</p>
        <h3 style={{ margin: '1rem 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
          ATTENDANCE SHEET {monthName.toUpperCase()} {selectedYear}
        </h3>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderBottom: 'none', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
        <div>MONTH :- {monthName.toUpperCase()}</div>
        <div>01-{monthName.toUpperCase()} TO {daysInMonth}-{monthName.toUpperCase()}</div>
        <div>STAFF ATTENDANCE REGISTER-{selectedYear}</div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.slipTable}>
          <thead>
            <tr>
              <th rowSpan="2" style={{ backgroundColor: '#f8fafc', width: '150px' }}>NAME</th>
              <th rowSpan="2" style={{ backgroundColor: '#f8fafc', width: '100px' }}>DESIGNATION</th>
              {dates.map(d => (
                <th key={d} style={{ backgroundColor: '#1e293b', color: '#fff', width: '24px' }}>{d}</th>
              ))}
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#f1f5f9' }}>Summer vacation</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>Absent</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#ffedd5', color: '#9a3412' }}>Sunday / HOLIDAY</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#dcfce7', color: '#166534' }}>CL</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>Present</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>Holiday / Present</th>
            </tr>
            <tr>
              {dates.map(d => (
                <th key={d} style={{ backgroundColor: '#475569', color: '#fff', fontSize: '0.55rem', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{getDayName(d)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allStaff.map(s => {
              const counts = calculateCounts(s.id);
              return (
                <tr key={s.id}>
                  <td className={styles.nameCol}>
                    <input 
                      type="text" 
                      value={s.name} 
                      onChange={(e) => updateProfile(s.id, 'name', e.target.value)}
                      className={`${styles.noPrint} ${styles.modernInput}`}
                      style={{ fontWeight: 'bold', width: '100%', fontSize: '0.75rem' }}
                    />
                    <span className="print-only" style={{ fontWeight: 'bold' }}>{s.name}</span>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.role || s.designation || 'Staff'} 
                      onChange={(e) => updateProfile(s.id, 'role', e.target.value)}
                      className={`${styles.noPrint} ${styles.modernInput}`}
                      style={{ width: '100%', textAlign: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}
                    />
                    <span className="print-only" style={{ fontWeight: 'bold' }}>{(s.role || s.designation || 'Staff').toUpperCase()}</span>
                  </td>
                  {dates.map(d => {
                    const status = getStatus(s.id, d);
                    const statusClass = status ? styles[`att${status}`] : styles.attEmpty;
                    return (
                      <td 
                        key={d} 
                        onClick={() => handleCellClick(s, d)}
                        className={`${styles.attCell} ${statusClass}`}
                      >
                        {status}
                      </td>
                    );
                  })}
                  <td></td>
                  <td style={{ fontWeight: 'bold' }}>{counts.A || ''}</td>
                  <td style={{ fontWeight: 'bold' }}>{counts.SUN + counts.H || ''}</td>
                  <td style={{ fontWeight: 'bold' }}>{counts.CL || ''}</td>
                  <td style={{ fontWeight: 'bold' }}>{counts.P || ''}</td>
                  <td style={{ fontWeight: 'bold' }}>{counts.TotalPresent || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <table className={styles.slipTable} style={{ width: '200px' }}>
          <thead>
             <tr><th colSpan="2" style={{ backgroundColor: '#f1f5f9' }}>NOTE:-</th></tr>
          </thead>
          <tbody>
             <tr><td className={styles.attP}>PRESENT</td><td className={styles.attP} style={{ fontWeight: 'bold' }}>P</td></tr>
             <tr><td className={styles.attA}>ABSENT</td><td className={styles.attA} style={{ fontWeight: 'bold' }}>A</td></tr>
             <tr><td className={styles.attSUN}>SUNDAY</td><td className={styles.attSUN} style={{ fontWeight: 'bold' }}>SUN</td></tr>
             <tr><td className={styles.attCL}>CL</td><td className={styles.attCL} style={{ fontWeight: 'bold' }}>CL</td></tr>
             <tr><td className={styles.attH}>HOLIDAY</td><td className={styles.attH} style={{ fontWeight: 'bold' }}>HOLIDAY</td></tr>
             <tr><td className={styles.attOT}>OVER TIME</td><td className={styles.attOT} style={{ fontWeight: 'bold' }}>OT</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSheetTab;
