import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

const SalaryRegisterTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, calendar, payroll, setPayroll } = useContext(AppContext);
  
  const allStaff = useMemo(() => [...faculty, ...staff], [faculty, staff]);
  const daysInMonth = useMemo(() => new Date(selectedYear, selectedMonth + 1, 0).getDate(), [selectedMonth, selectedYear]);
  const monthName = useMemo(() => new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }), [selectedMonth, selectedYear]);

  // Track manual inputs for Fooding and Advance per staff for the current month
  // In a real app, these would be in the database/context. 
  // We'll use the existing 'payroll' records if they exist, or local state for editing.
  
  const getAttendanceData = (memberId) => {
    let working = 0;
    let sundays = 0;
    let absent = 0;
    let cl = 0;
    let holiday = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(selectedYear, selectedMonth, d).getDay();
      
      const record = staffAttendance.find(a => a.memberId === memberId && a.date === dateStr);
      const isHoliday = calendar.find(c => c.date === dateStr && (c.type === 'Holiday' || c.category === 'Holiday'));

      if (dayOfWeek === 0) sundays++;
      else if (isHoliday) holiday++;
      
      if (record?.status === 'P') working++;
      else if (record?.status === 'A') absent++;
      else if (record?.status === 'CL') cl++;
    }

    return { working, sundays, absent, cl, holiday };
  };

  const calculateSalary = (staffMember) => {
    const { working, sundays, absent, cl, holiday } = getAttendanceData(staffMember.id);
    const basicSalary = Number(staffMember.baseSalary || staffMember.salary || 10000);
    
    // Formula: Working Days With Holiday = Working + Sundays + Holidays + CL (paid)
    const workingDaysWithHoliday = working + sundays + holiday + cl;
    
    const amount = Math.round((basicSalary / daysInMonth) * workingDaysWithHoliday);
    
    // Find existing payroll record for this month
    const existing = payroll.find(p => p.employeeId === staffMember.id && p.month === `${monthName} ${selectedYear}`);
    
    const fooding = existing?.fooding || 0;
    const advance = existing?.advance || 0;
    const netPayment = amount - fooding - advance;

    return {
      basicSalary,
      sundays,
      absent,
      working,
      cl,
      workingDaysWithHoliday,
      amount,
      fooding,
      advance,
      netPayment,
      totalCL: 21,
      usedCL: 0, // Should be calculated from all months in selectedYear
      balanceCL: 21
    };
  };

  const totals = useMemo(() => {
    return allStaff.reduce((acc, s) => {
      const calc = calculateSalary(s);
      acc.amount += calc.amount;
      acc.fooding += calc.fooding;
      acc.advance += calc.advance;
      acc.netPayment += calc.netPayment;
      return acc;
    }, { amount: 0, fooding: 0, advance: 0, netPayment: 0 });
  }, [allStaff, selectedMonth, selectedYear, payroll]);

  return (
    <div className={styles.salaryPrintArea}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>KASHIBAI GANPAT COLLEGE</h2>
        <h3 style={{ margin: 0, fontSize: '1rem', textDecoration: 'underline' }}>
          SALARY SLIP FOR THE MONTH OF {monthName.toUpperCase()} {selectedYear}
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.slipTable}>
          <thead>
            <tr>
              <th>S.NO</th>
              <th className={styles.nameCol}>NAME</th>
              <th>DESIGNATION</th>
              <th>BASIC SALARY</th>
              <th>TOTAL SUNDAY HOLIDAY</th>
              <th>ABSENT</th>
              <th>WORKING</th>
              <th>C.L</th>
              <th>WORKING DAY WITH HOLIDAY</th>
              <th>AMOUNT</th>
              <th>FOODING</th>
              <th>ADVANCE</th>
              <th>TOTAL</th>
              <th>NET PAYMENT</th>
              <th>TOTAL CASUAL LEAVE</th>
              <th>TOTAL LEAVE USE</th>
              <th>THIS MONTH</th>
              <th>LEAVE BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map((s, index) => {
              const calc = calculateSalary(s);
              return (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td className={styles.nameCol}>{s.name}</td>
                  <td>{s.role || s.designation || 'Staff'}</td>
                  <td>₹{calc.basicSalary.toLocaleString()}</td>
                  <td>{calc.sundays}</td>
                  <td>{calc.absent}</td>
                  <td>{calc.working}</td>
                  <td>{calc.cl}</td>
                  <td>{calc.workingDaysWithHoliday}</td>
                  <td>₹{calc.amount.toLocaleString()}</td>
                  <td>{calc.fooding > 0 ? `₹${calc.fooding}` : '-'}</td>
                  <td>{calc.advance > 0 ? `₹${calc.advance}` : '-'}</td>
                  <td>₹{(calc.fooding + calc.advance).toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{calc.netPayment.toLocaleString()}</td>
                  <td>{calc.totalCL}</td>
                  <td>{calc.usedCL}</td>
                  <td>{calc.cl}</td>
                  <td>{calc.balanceCL - calc.cl}</td>
                </tr>
              );
            })}
            <tr className={styles.totalRow}>
              <td colSpan="9" style={{ textAlign: 'right', paddingRight: '1rem' }}>TOTAL</td>
              <td>₹{totals.amount.toLocaleString()}</td>
              <td>₹{totals.fooding.toLocaleString()}</td>
              <td>₹{totals.advance.toLocaleString()}</td>
              <td>₹{(totals.fooding + totals.advance).toLocaleString()}</td>
              <td>₹{totals.netPayment.toLocaleString()}</td>
              <td colSpan="4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '3rem', fontWeight: 700 }}>
         <span>NET PAYMENT: ₹{totals.netPayment.toLocaleString()}</span>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <div style={{ borderTop: '1px solid #000', paddingTop: '0.5rem', width: '150px', textAlign: 'center' }}>Checked By</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0 }}>For</p>
          <p style={{ margin: 0, fontWeight: 700 }}>PRINCIPAL</p>
          <p style={{ margin: 0 }}>KASHIBAI GANPAT NURSING COLLEGE</p>
        </div>
        <div style={{ borderTop: '1px solid #000', paddingTop: '0.5rem', width: '150px', textAlign: 'center' }}>Managing Director</div>
      </div>
      
      <div className={styles.noPrint} style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>CL Status (Annual)</h4>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {allStaff.map(s => {
            const calc = calculateSalary(s);
            return (
              <div key={s.id} style={{ fontSize: '0.85rem' }}>
                <strong>{s.name}:</strong> {calc.balanceCL - calc.cl} / 21 remaining
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalaryRegisterTab;
