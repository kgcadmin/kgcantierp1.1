import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

const BankPaymentTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, calendar, payroll, editFaculty, editStaff } = useContext(AppContext);
  
  const allStaff = useMemo(() => [...faculty, ...staff], [faculty, staff]);
  const daysInMonth = useMemo(() => new Date(selectedYear, selectedMonth + 1, 0).getDate(), [selectedMonth, selectedYear]);
  const monthName = useMemo(() => new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }), [selectedMonth, selectedYear]);

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
    
    const existing = payroll.find(p => p.employeeId === staffMember.id && p.month === `${monthName} ${selectedYear}`);
    const deductions = (existing?.fooding || 0) + (existing?.advance || 0);
    
    return amount - deductions;
  };

  const formatCurrency = (val) => {
    return '₹ ' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalAmount = useMemo(() => {
    return allStaff.reduce((sum, s) => sum + calculateNetPayment(s), 0);
  }, [allStaff, selectedMonth, selectedYear, payroll, staffAttendance]);

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeader}>
        <h2 className={styles.reportTitle}>Bank Disbursement File</h2>
        <p className={styles.reportSubtitle}>{monthName} {selectedYear} • Account Details & Net Transfers</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.modernTable}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>No.</th>
              <th style={{ width: '220px' }}>Employee</th>
              <th style={{ width: '180px' }}>Bank Name</th>
              <th style={{ width: '150px' }}>Branch</th>
              <th style={{ width: '200px' }}>Account Number</th>
              <th style={{ width: '150px' }}>IFSC Code</th>
              <th style={{ width: '220px' }}>Account Holder Name</th>
              <th className={styles.netPayCell} style={{ textAlign: 'right', width: '150px' }}>Transfer Amount</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map((s, index) => {
              const netPay = calculateNetPayment(s);
              return (
                <tr key={s.id}>
                  <td style={{ color: '#64748b', fontWeight: 500 }}>{index + 1}</td>
                  <td>
                    <input 
                      type="text" 
                      value={s.name} 
                      onChange={e => updateProfile(s.id, 'name', e.target.value)} 
                      className={styles.editInput} 
                      style={{ fontWeight: 600 }} 
                      placeholder="Employee Name" 
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.bankName || ''} 
                      onChange={e => updateProfile(s.id, 'bankName', e.target.value)} 
                      className={styles.editInput} 
                      placeholder="e.g. State Bank of India" 
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.bankBranch || ''} 
                      onChange={e => updateProfile(s.id, 'bankBranch', e.target.value)} 
                      className={styles.editInput} 
                      placeholder="Branch City/Code" 
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.accountNumber || ''} 
                      onChange={e => updateProfile(s.id, 'accountNumber', e.target.value)} 
                      className={styles.editInput} 
                      style={{ fontFamily: 'monospace', letterSpacing: '1px', fontWeight: 600 }} 
                      placeholder="Account No." 
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.ifscCode || ''} 
                      onChange={e => updateProfile(s.id, 'ifscCode', e.target.value)} 
                      className={styles.editInput} 
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }} 
                      placeholder="IFSC" 
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.bankHolderName || s.name} 
                      onChange={e => updateProfile(s.id, 'bankHolderName', e.target.value)} 
                      className={styles.editInput} 
                      placeholder="Account Holder" 
                    />
                  </td>
                  <td className={styles.netPayCell} style={{ textAlign: 'right' }}>
                    {formatCurrency(netPay)}
                  </td>
                </tr>
              );
            })}
            <tr className={styles.totalRow}>
              <td colSpan="7" style={{ textAlign: 'right', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Disbursement Amount</td>
              <td className={styles.netPayCell} style={{ textAlign: 'right', fontSize: '1.2rem' }}>{formatCurrency(totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className={styles.noPrint} style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
        <p style={{ margin: 0 }}>Tip: Ensure IFSC codes and Account Numbers are correct before generating the final bank transfer file.</p>
      </div>
    </div>
  );
};

export default BankPaymentTab;
