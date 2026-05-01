import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

const BankPaymentTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, calendar, payroll } = useContext(AppContext);
  
  const allStaff = useMemo(() => [...faculty, ...staff], [faculty, staff]);
  const daysInMonth = useMemo(() => new Date(selectedYear, selectedMonth + 1, 0).getDate(), [selectedMonth, selectedYear]);
  const monthName = useMemo(() => new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }), [selectedMonth, selectedYear]);

  const calculateNetPayment = (staffMember) => {
    let working = 0;
    let sundays = 0;
    let cl = 0;
    let holiday = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(selectedYear, selectedMonth, d).getDay();
      const record = staffAttendance.find(a => a.memberId === staffMember.id && a.date === dateStr);
      const isHoliday = calendar.find(c => c.date === dateStr && (c.type === 'Holiday' || c.category === 'Holiday'));

      if (dayOfWeek === 0) sundays++;
      else if (isHoliday) holiday++;
      
      if (record?.status === 'P') working++;
      else if (record?.status === 'CL') cl++;
    }

    const basicSalary = Number(staffMember.baseSalary || staffMember.salary || 10000);
    const workingDaysWithHoliday = working + sundays + holiday + cl;
    const amount = Math.round((basicSalary / daysInMonth) * workingDaysWithHoliday);
    
    const existing = payroll.find(p => p.employeeId === staffMember.id && p.month === `${monthName} ${selectedYear}`);
    const deductions = (existing?.fooding || 0) + (existing?.advance || 0);
    
    return amount - deductions;
  };

  const totalAmount = useMemo(() => {
    return allStaff.reduce((sum, s) => sum + calculateNetPayment(s), 0);
  }, [allStaff, selectedMonth, selectedYear, payroll]);

  return (
    <div className={styles.salaryPrintArea}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>KASHIBAI GANPAT COLLEGE</h2>
        <p style={{ margin: 0, fontSize: '0.8rem' }}>VILL - CHAKME, [THAKUR GAON] BURMU, RANCHI-835205</p>
        <h3 style={{ margin: '0.5rem 0', fontSize: '0.9rem', textDecoration: 'underline' }}>
          BANK DETAILS & PA. {monthName.toUpperCase()} {selectedYear}
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.slipTable}>
          <thead>
            <tr>
              <th>Sl.No</th>
              <th className={styles.nameCol}>STAFF NAME</th>
              <th>BANK NAME</th>
              <th>BRANCH NAME</th>
              <th>ACCOUNT NUMBER</th>
              <th>IFSC CODE</th>
              <th>BANK HOLDER NAME</th>
              <th>{monthName.toUpperCase()}</th>
              <th>NET PAYMENT</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map((s, index) => {
              const netPay = calculateNetPayment(s);
              return (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td className={styles.nameCol}>{s.name}</td>
                  <td>{s.bankName || 'SBI'}</td>
                  <td>{s.bankBranch || 'MAIN BRANCH'}</td>
                  <td style={{ letterSpacing: '1px' }}>{s.accountNumber || 'XXXXXXXXXXXX'}</td>
                  <td>{s.ifscCode || 'SBIN000XXXX'}</td>
                  <td>{s.bankHolderName || s.name}</td>
                  <td>₹{netPay.toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{netPay.toLocaleString()}</td>
                </tr>
              );
            })}
            <tr className={styles.totalRow}>
              <td colSpan="7" style={{ textAlign: 'right', paddingRight: '1rem' }}>TOTAL AMOUNT</td>
              <td>₹{totalAmount.toLocaleString()}</td>
              <td>₹{totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px' }}></div>
          <p style={{ borderTop: '1px solid #000', width: '150px', paddingTop: '0.5rem' }}>Checked By</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px' }}></div>
          <p style={{ borderTop: '1px solid #000', width: '150px', paddingTop: '0.5rem' }}>Principal</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px' }}></div>
          <p style={{ borderTop: '1px solid #000', width: '150px', paddingTop: '0.5rem' }}>Managing Director</p>
        </div>
      </div>
    </div>
  );
};

export default BankPaymentTab;
