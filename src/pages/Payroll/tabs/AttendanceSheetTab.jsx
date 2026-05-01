import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

const AttendanceSheetTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, calendar } = useContext(AppContext);
  
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

  const getAttendanceStatus = (memberId, day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayName = new Date(selectedYear, selectedMonth, day).getDay();
    
    // Check if Sunday
    if (dayName === 0) return 'SUN';
    
    // Check holiday from calendar
    const holiday = calendar.find(c => c.date === dateStr && (c.type === 'Holiday' || c.category === 'Holiday'));
    if (holiday) return 'H';

    const record = staffAttendance.find(a => a.memberId === memberId && a.date === dateStr);
    return record?.status || ''; // P, A, CL, etc.
  };

  const calculateCounts = (memberId) => {
    const counts = { P: 0, A: 0, SUN: 0, CL: 0, H: 0, OT: 0, Total: 0 };
    dates.forEach(day => {
      const status = getAttendanceStatus(memberId, day);
      if (status === 'P') counts.P++;
      else if (status === 'A') counts.A++;
      else if (status === 'SUN') counts.SUN++;
      else if (status === 'CL') counts.CL++;
      else if (status === 'H') counts.H++;
      else if (status === 'OT') counts.OT++;
    });
    counts.Total = counts.P + counts.SUN + counts.H + counts.CL + (counts.OT * 0.5); // Simplified OT logic
    counts.PresentTotal = counts.P + counts.SUN + counts.H + counts.CL;
    return counts;
  };

  return (
    <div className={styles.salaryPrintArea}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>KASHIBAI GANPAT COLLEGE</h2>
        <h3 style={{ margin: 0, fontSize: '1rem', textDecoration: 'underline' }}>
          ATTENDANCE SHEET {monthName.toUpperCase()} {selectedYear}
        </h3>
        <p style={{ margin: '0.2rem 0', fontSize: '0.8rem' }}>
          01-{monthName.toUpperCase()} TO {daysInMonth}-{monthName.toUpperCase()} STAFF ATTENDANCE REGISTER-{selectedYear}
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.slipTable}>
          <thead className={styles.attGrid}>
            <tr>
              <th rowSpan="2" className={styles.nameCol}>NAME</th>
              <th rowSpan="2">DESIGNATION</th>
              {dates.map(d => (
                <th key={d} className={styles.attCell} style={{ fontSize: '0.6rem' }}>{getDayName(d)}</th>
              ))}
              <th colSpan="6">SUMMARY</th>
            </tr>
            <tr>
              {dates.map(d => (
                <th key={d} className={styles.attCell}>{d}</th>
              ))}
              <th>A</th>
              <th>SUN</th>
              <th>CL</th>
              <th>P</th>
              <th>H/P</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map(s => {
              const counts = calculateCounts(s.id);
              return (
                <tr key={s.id}>
                  <td className={styles.nameCol}>{s.name}</td>
                  <td>{s.role || s.designation || 'Staff'}</td>
                  {dates.map(d => {
                    const status = getAttendanceStatus(s.id, d);
                    return (
                      <td key={d} className={`${styles.attCell} ${styles['att' + status] || ''}`}>
                        {status === 'SUN' ? 'S' : status}
                      </td>
                    );
                  })}
                  <td style={{ background: '#f8d7da' }}>{counts.A}</td>
                  <td style={{ background: '#fff3cd' }}>{counts.SUN}</td>
                  <td style={{ background: '#cce5ff' }}>{counts.CL}</td>
                  <td style={{ background: '#d4edda' }}>{counts.P}</td>
                  <td>{counts.H}</td>
                  <td style={{ fontWeight: 700 }}>{counts.PresentTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <div style={{ borderTop: '1px solid #000', paddingTop: '0.5rem', width: '200px', textAlign: 'center' }}>Checked By</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0 }}>For</p>
          <p style={{ margin: 0, fontWeight: 700 }}>PRINCIPAL</p>
          <p style={{ margin: 0 }}>KASHIBAI GANPAT NURSING COLLEGE</p>
        </div>
        <div style={{ borderTop: '1px solid #000', paddingTop: '0.5rem', width: '200px', textAlign: 'center' }}>Managing Director</div>
      </div>
    </div>
  );
};

export default AttendanceSheetTab;
