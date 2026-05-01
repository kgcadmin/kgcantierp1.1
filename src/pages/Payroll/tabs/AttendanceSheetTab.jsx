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
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>KASHIBAI GANPAT COLLEGE</h2>
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
                  <td className={styles.nameCol}>
                    <input 
                      type="text" 
                      value={s.name} 
                      onChange={(e) => updateProfile(s.id, 'name', e.target.value)}
                      className={styles.noPrint}
                      style={{ border: 'none', background: 'transparent', fontWeight: 600, width: '100%', fontSize: '0.75rem' }}
                    />
                    <span className="print-only" style={{ fontWeight: 600 }}>{s.name}</span>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.role || s.designation || 'Staff'} 
                      onChange={(e) => updateProfile(s.id, 'role', e.target.value)}
                      className={styles.noPrint}
                      style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center', fontSize: '0.65rem' }}
                    />
                    <span className="print-only">{(s.role || s.designation || 'Staff').toUpperCase()}</span>
                  </td>
                  {dates.map(d => {
                    const status = getStatus(s.id, d);
                    return (
                      <td 
                        key={d} 
                        onClick={() => handleCellClick(s, d)}
                        className={`${styles.attCell} ${styles['att' + status] || ''}`}
                        style={{ cursor: 'pointer' }}
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

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
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
      <style>{`
        @media screen { .print-only { display: none; } }
        @media print { .print-only { display: block; } .no-print { display: none !important; } }
      `}</style>
    </div>
  );
};

export default AttendanceSheetTab;
