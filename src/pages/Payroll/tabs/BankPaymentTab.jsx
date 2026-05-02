import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

const BankPaymentTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, calendar, payroll, editFaculty, editStaff } = useContext(AppContext);
  
  const allStaff = useMemo(() => [...faculty, ...staff], [faculty, staff]);
  
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const monthName = useMemo(() => {
    return new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });
  }, [selectedMonth, selectedYear]);

  const updateProfile = (id, field, value) => {
    const isFaculty = faculty.some(f => f.id === id);
    if (isFaculty) editFaculty(id, { [field]: value });
    else editStaff(id, { [field]: value });
  };

  const calculateNetPayment = (staffMember) => {
    let working = 0;
    let sundays = 0;
    let cl = 0;
    let holiday = 0;
    let ot = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(selectedYear, selectedMonth, d).getDay();
      const record = staffAttendance.find(a => a.memberId === staffMember.id && a.date === dateStr);
      const isHoliday = calendar.find(c => c.date === dateStr && (c.type === 'Holiday' || c.category === 'Holiday'));

      if (record?.status === 'P') working++;
      else if (record?.status === 'CL') cl++;
      else if (record?.status === 'OT') ot++;
      else if (record?.status === 'SUN' || (!record?.status && dayOfWeek === 0)) sundays++;
      else if (record?.status === 'H' || (!record?.status && isHoliday)) holiday++;
    }

    const basicSalary = Number(staffMember.baseSalary || staffMember.salary || 10000);
    const workingDaysWithHoliday = working + sundays + holiday + cl + ot;
    const amount = Math.round((basicSalary / daysInMonth) * workingDaysWithHoliday);
    
    const monthKey = `${monthName} ${selectedYear}`;
    const existing = payroll.find(p => p.employeeId === staffMember.id && p.month === monthKey);
    const deductions = (existing?.fooding || 0) + (existing?.advance || 0);
    
    return amount - deductions;
  };

  const totalAmount = useMemo(() => {
    return allStaff.reduce((sum, s) => sum + calculateNetPayment(s), 0);
  }, [allStaff, selectedMonth, selectedYear, payroll, staffAttendance]);

  return (
    <div className={styles.salaryPrintArea}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 className={styles.headerTitle} style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>KASHIBAI GANPAT COLLEGE</h1>
        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.5px' }}>VILL - CHAKME, (THAKUR GAON) BURMU, RANCHI- 835205</p>
        <h3 style={{ margin: '1rem 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
          BANK DETAILS & PA . {monthName.toUpperCase()} {selectedYear}
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.slipTable}>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>S.N</th>
              <th className={styles.nameCol}>NAME OF STAFF</th>
              <th>NAME OF BANK</th>
              <th>BRANCH</th>
              <th>ACCOUNT NO.</th>
              <th>IFSC CODE</th>
              <th>BANK HOLDER NAME</th>
              <th>MONTH AMOUNT</th>
              <th>NET PAYMENT</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map((s, index) => {
              const netPay = calculateNetPayment(s);
              return (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td className={styles.nameCol}>
                    <input 
                      type="text" 
                      value={s.name} 
                      onChange={(e) => updateProfile(s.id, 'name', e.target.value)}
                      className={`${styles.noPrint} ${styles.modernInput}`}
                      style={{ fontWeight: 'bold' }}
                    />
                    <span className="print-only" style={{ fontWeight: 'bold' }}>{s.name}</span>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.bankName || ''} 
                      onChange={(e) => updateProfile(s.id, 'bankName', e.target.value)}
                      className={`${styles.noPrint} ${styles.modernInput}`}
                      placeholder="Bank Name"
                    />
                    <span className="print-only">{s.bankName || ''}</span>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.bankBranch || ''} 
                      onChange={(e) => updateProfile(s.id, 'bankBranch', e.target.value)}
                      className={`${styles.noPrint} ${styles.modernInput}`}
                      placeholder="Branch"
                    />
                    <span className="print-only">{s.bankBranch || ''}</span>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.accountNumber || ''} 
                      onChange={(e) => updateProfile(s.id, 'accountNumber', e.target.value)}
                      className={`${styles.noPrint} ${styles.modernInput}`}
                      placeholder="Account No."
                    />
                    <span className="print-only">{s.accountNumber || ''}</span>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.ifscCode || ''} 
                      onChange={(e) => updateProfile(s.id, 'ifscCode', e.target.value)}
                      className={`${styles.noPrint} ${styles.modernInput}`}
                      placeholder="IFSC"
                    />
                    <span className="print-only">{s.ifscCode || ''}</span>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.bankHolderName || ''} 
                      onChange={(e) => updateProfile(s.id, 'bankHolderName', e.target.value)}
                      className={`${styles.noPrint} ${styles.modernInput}`}
                      placeholder="Holder Name"
                    />
                    <span className="print-only">{s.bankHolderName || ''}</span>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{netPay}</td>
                  <td style={{ fontWeight: 'bold' }}>{netPay}</td>
                </tr>
              );
            })}
            <tr className={styles.totalRow}>
              <td colSpan="7" style={{ textAlign: 'right', paddingRight: '1rem' }}>TOTAL</td>
              <td style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{totalAmount}</td>
              <td style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{totalAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
        <div style={{ textAlign: 'left', minWidth: '200px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}></p>
        </div>
        <div style={{ textAlign: 'center', minWidth: '200px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1e3a8a' }}>for</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1e3a8a' }}>PRINCIPAL</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#1e3a8a' }}>KASHIBAI GANPAT NURSING</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#1e3a8a' }}>COLLEGE</p>
        </div>
        <div style={{ textAlign: 'right', minWidth: '200px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.8rem', color: '#1e3a8a' }}>KASHIBAI GANPAT COLLEGE</p>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.8rem', color: '#1e3a8a' }}>OF PHARMACY</p>
        </div>
      </div>
    </div>
  );
};

export default BankPaymentTab;
