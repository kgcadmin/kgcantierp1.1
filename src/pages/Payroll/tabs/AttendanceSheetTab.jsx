import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

const AttendanceSheetTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, markStaffAttendance, calendar } = useContext(AppContext);
  
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

    // Default status if no record
    if (dayName === 0) return 'SUN';
    const holiday = calendar.find(c => c.date === dateStr && (c.type === 'Holiday' || c.category === 'Holiday'));
    if (holiday) return 'H';

    return ''; 
  };

  const handleCellClick = (member, day) => {
    const currentStatus = getStatus(member.id, day);
    const statuses = ['', 'P', 'A', 'CL', 'OT', 'H', 'SUN'];
    let nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    markStaffAttendance(member.id, member.role === 'Faculty' ? 'Faculty' : 'Staff', dateStr, '', '', nextStatus);
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
    counts.GrandTotal = counts.TotalPresent + (counts.OT * 0.5); // OT adds 0.5 extra working day
    return counts;
  };

  return (
    <div className={styles.salaryPrintArea}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '1px' }}>KASHIBAI GANPAT COLLEGE</h2>
        <h3 style={{ margin: '0.2rem 0', fontSize: '1.1rem', textDecoration: 'underline' }}>
          ATTENDANCE SHEET {monthName.toUpperCase()} {selectedYear}
        </h3>
        <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', fontWeight: 600 }}>
          01-{monthName.toUpperCase()} TO {daysInMonth}-{monthName.toUpperCase()} STAFF ATTENDANCE REGISTER-{selectedYear}
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.slipTable}>
          <thead className={styles.attGrid}>
            <tr>
              <th rowSpan="2" className={styles.nameCol} style={{ width: '180px' }}>NAME</th>
              <th rowSpan="2" style={{ width: '120px' }}>DESIGNATION</th>
              {dates.map(d => (
                <th key={d} className={styles.attCell}>{getDayName(d)}</th>
              ))}
              <th colSpan="6" style={{ background: '#eee' }}>SUMMARY</th>
            </tr>
            <tr>
              {dates.map(d => (
                <th key={d} className={styles.attCell}>{d}</th>
              ))}
              <th style={{ background: '#f8d7da', width: '30px' }}>A</th>
              <th style={{ background: '#fff3cd', width: '30px' }}>SUN</th>
              <th style={{ background: '#cce5ff', width: '30px' }}>CL</th>
              <th style={{ background: '#d4edda', width: '30px' }}>P</th>
              <th style={{ background: '#e2e3e5', width: '30px' }}>H/P</th>
              <th style={{ background: '#ccc', width: '40px' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map(s => {
              const counts = calculateCounts(s.id);
              return (
                <tr key={s.id}>
                  <td className={styles.nameCol} style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ fontSize: '0.65rem' }}>{(s.role || s.designation || 'Staff').toUpperCase()}</td>
                  {dates.map(d => {
                    const status = getStatus(s.id, d);
                    return (
                      <td 
                        key={d} 
                        onClick={() => handleCellClick(s, d)}
                        className={`${styles.attCell} ${styles['att' + status] || ''}`}
                        style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                        title="Click to change status"
                      >
                        {status === 'SUN' ? 'SUN' : status === 'OT' ? 'OT' : status}
                      </td>
                    );
                  })}
                  <td style={{ background: '#f8d7da', fontWeight: 700 }}>{counts.A || ''}</td>
                  <td style={{ background: '#fff3cd', fontWeight: 700 }}>{counts.SUN || ''}</td>
                  <td style={{ background: '#cce5ff', fontWeight: 700 }}>{counts.CL || ''}</td>
                  <td style={{ background: '#d4edda', fontWeight: 700 }}>{counts.P || ''}</td>
                  <td style={{ background: '#e2e3e5', fontWeight: 700 }}>{counts.H || ''}</td>
                  <td style={{ background: '#eee', fontWeight: 800 }}>{counts.TotalPresent}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fdfdfd', border: '1px solid #eee', borderRadius: '4px' }} className={styles.noPrint}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Legend & Instructions:</h4>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span className={`${styles.attCell} ${styles.attP}`}>P</span> Present</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span className={`${styles.attCell} ${styles.attA}`}>A</span> Absent</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span className={`${styles.attCell} ${styles.attSUN}`}>SUN</span> Sunday</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span className={`${styles.attCell} ${styles.attCL}`}>CL</span> Casual Leave</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span className={`${styles.attCell} ${styles.attH}`}>H</span> Holiday</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span className={`${styles.attCell} ${styles.attOT}`}>OT</span> Over Time</div>
        </div>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#666' }}>💡 Click any cell in the grid to cycle through attendance statuses. Changes are saved automatically.</p>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <div style={{ textAlign: 'center' }}>
           <div style={{ width: '150px', borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '30px' }}></div>
           <p style={{ margin: 0, fontWeight: 700 }}>Checked By</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0 }}>For</p>
          <p style={{ margin: 0, fontWeight: 800 }}>PRINCIPAL</p>
          <p style={{ margin: 0, fontSize: '0.75rem' }}>KASHIBAI GANPAT NURSING COLLEGE</p>
        </div>
        <div style={{ textAlign: 'center' }}>
           <div style={{ width: '150px', borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '30px' }}></div>
           <p style={{ margin: 0, fontWeight: 700 }}>Managing Director</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSheetTab;
