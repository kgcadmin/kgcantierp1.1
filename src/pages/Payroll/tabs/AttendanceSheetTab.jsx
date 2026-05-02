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

    return 'P'; // Defaulting to P to match typical excel usage where it's pre-filled
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
    <div className={styles.salaryPrintArea} style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', backgroundColor: '#3b3b4f', color: '#fff', padding: '5px' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', letterSpacing: '1px' }}>ATTENDANCE SHEET {monthName.toUpperCase()} {selectedYear}</h2>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f4f4f4', border: '1px solid #000', padding: '2px 10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
        <div>MONTH :- {monthName.toUpperCase()}</div>
        <div>01-{monthName.toUpperCase()} TO {daysInMonth}-{monthName.toUpperCase()}</div>
        <div>STAFF ATTENDANCE REGESTER-{selectedYear}</div>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '5px' }}>
        <table className={styles.slipTable}>
          <thead>
            <tr>
              <th rowSpan="2" style={{ backgroundColor: '#fff2cc', width: '150px' }}>NAME</th>
              <th rowSpan="2" style={{ backgroundColor: '#fff2cc', width: '100px' }}>DESIGNATION</th>
              {dates.map(d => (
                <th key={d} style={{ backgroundColor: '#e53935', color: '#fff', width: '22px' }}>{d}</th>
              ))}
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#f06292', color: '#fff' }}>Summer vacation</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#7b1fa2', color: '#fff' }}>Absent</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#d32f2f', color: '#fff' }}>Sunday / HOLIDAY</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#c2185b', color: '#fff' }}>CL</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#1976d2', color: '#fff' }}>Present</th>
              <th rowSpan="2" className={styles.verticalHeader} style={{ backgroundColor: '#c2185b', color: '#fff' }}>Holiday / Present</th>
            </tr>
            <tr>
              {dates.map(d => (
                <th key={d} style={{ backgroundColor: '#e53935', color: '#fff', fontSize: '0.55rem', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{getDayName(d)}</th>
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
                      className={styles.noPrint}
                      style={{ border: 'none', background: 'transparent', fontWeight: 'bold', width: '100%', fontSize: '0.65rem' }}
                    />
                    <span className="print-only" style={{ fontWeight: 'bold' }}>{s.name}</span>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.role || s.designation || 'Staff'} 
                      onChange={(e) => updateProfile(s.id, 'role', e.target.value)}
                      className={styles.noPrint}
                      style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}
                    />
                    <span className="print-only" style={{ fontWeight: 'bold' }}>{(s.role || s.designation || 'Staff').toUpperCase()}</span>
                  </td>
                  {dates.map(d => {
                    const status = getStatus(s.id, d);
                    return (
                      <td 
                        key={d} 
                        onClick={() => handleCellClick(s, d)}
                        className={`${styles.attCell} ${styles['att' + status] || ''}`}
                        style={{ cursor: 'pointer', border: '1px solid #ccc' }}
                      >
                        {status === 'SUN' ? 'SUN' : status === 'OT' ? 'OT' : status}
                      </td>
                    );
                  })}
                  <td style={{ backgroundColor: '#e1bee7', fontWeight: 'bold', color: '#000' }}>0</td>
                  <td style={{ backgroundColor: '#f8bbd0', fontWeight: 'bold', color: '#000' }}>{counts.A}</td>
                  <td style={{ backgroundColor: '#ffcdd2', fontWeight: 'bold', color: '#000' }}>{counts.SUN + counts.H}</td>
                  <td style={{ backgroundColor: '#f8bbd0', fontWeight: 'bold', color: '#000' }}>{counts.CL}</td>
                  <td style={{ backgroundColor: '#bbdefb', fontWeight: 'bold', color: '#000' }}>{counts.P}</td>
                  <td style={{ backgroundColor: '#283593', fontWeight: 'bold', color: '#fff' }}>{counts.TotalPresent}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', width: '400px' }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', fontWeight: 'bold' }}>NOTE:-</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ width: '100px', textAlign: 'center', padding: '4px', border: '1px solid #000' }}>P</td>
              <td style={{ padding: '4px 10px', border: '1px solid #000', backgroundColor: '#e3f2fd' }}>PRESENT</td>
            </tr>
            <tr>
              <td className={styles.attA} style={{ textAlign: 'center', padding: '4px', border: '1px solid #000' }}>A</td>
              <td style={{ padding: '4px 10px', border: '1px solid #000', backgroundColor: '#e3f2fd' }}>ABSENT</td>
            </tr>
            <tr>
              <td className={styles.attSUN} style={{ textAlign: 'center', padding: '4px', border: '1px solid #000' }}>SUN</td>
              <td style={{ padding: '4px 10px', border: '1px solid #000', backgroundColor: '#ffcdd2' }}>SUNDAY / HOLIDAY</td>
            </tr>
            <tr>
              <td className={styles.attCL} style={{ textAlign: 'center', padding: '4px', border: '1px solid #000' }}>CL</td>
              <td style={{ padding: '4px 10px', border: '1px solid #000', backgroundColor: '#c8e6c9' }}>CASUAL LEAVE</td>
            </tr>
            <tr>
              <td className={styles.attH} style={{ textAlign: 'center', padding: '4px', border: '1px solid #000' }}>HOLIDAY</td>
              <td style={{ padding: '4px 10px', border: '1px solid #000', backgroundColor: '#283593' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
        <div style={{ textAlign: 'left', minWidth: '200px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}></p>
        </div>
        <div style={{ textAlign: 'center', minWidth: '200px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>for</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1e3a8a' }}>PRINCIPAL</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#1e3a8a' }}>KASHIBAI GANPAT NURSING</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#1e3a8a' }}>COLLEGE</p>
        </div>
        <div style={{ textAlign: 'right', minWidth: '200px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.8rem', color: '#1e3a8a' }}>KASHIBAI GANPAT COLLEGE</p>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.8rem', color: '#1e3a8a' }}>OF PHARMACY</p>
        </div>
      </div>
      <style>{`
        @media screen { .print-only { display: none; } }
        @media print { .print-only { display: inline; } .no-print { display: none !important; } }
      `}</style>
    </div>
  );
};

export default AttendanceSheetTab;
