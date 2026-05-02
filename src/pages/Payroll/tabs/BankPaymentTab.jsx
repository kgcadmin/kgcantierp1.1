import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

/* Inline style applied to every editable input so it's always clean on screen */
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

const BankPaymentTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, calendar, payroll, editFaculty, editStaff } = useContext(AppContext);

  const allStaff = useMemo(() => [...faculty, ...staff], [faculty, staff]);

  const daysInMonth = useMemo(() =>
    new Date(selectedYear, selectedMonth + 1, 0).getDate(),
    [selectedMonth, selectedYear]);

  const monthName = useMemo(() =>
    new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }),
    [selectedMonth, selectedYear]);

  const updateProfile = (id, field, value) => {
    const isFaculty = faculty.some(f => f.id === id);
    if (isFaculty) editFaculty(id, { [field]: value });
    else editStaff(id, { [field]: value });
  };

  const calculateNetPayment = (staffMember) => {
    let working = 0, sundays = 0, cl = 0, holiday = 0, ot = 0;
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
    const workingDays = working + sundays + holiday + cl + ot;
    const amount = Math.round((basicSalary / daysInMonth) * workingDays);
    const monthKey = `${monthName} ${selectedYear}`;
    const existing = payroll.find(p => p.employeeId === staffMember.id && p.month === monthKey);
    const deductions = (existing?.fooding || 0) + (existing?.advance || 0);
    return amount - deductions;
  };

  const totalAmount = useMemo(() =>
    allStaff.reduce((sum, s) => sum + calculateNetPayment(s), 0),
    [allStaff, selectedMonth, selectedYear, payroll, staffAttendance]);

  const fmt = (val) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div className={styles.salaryPrintArea}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 className={styles.headerTitle} style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>KASHIBAI GANPAT COLLEGE</h1>
        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>VILL - CHAKME, (THAKUR GAON) BURMU, RANCHI- 835205</p>
        <h3 style={{ margin: '1rem 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
          BANK DETAILS &amp; PAYMENT — {monthName.toUpperCase()} {selectedYear}
        </h3>
      </div>

      {/* Table */}
      <div className={styles.scrollWrapper}>
        <table className={styles.slipTable}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>S.N</th>
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
                  <td style={{ color: '#64748b' }}>{index + 1}</td>
                  <td className={styles.nameCol}>
                    <input type="text" value={s.name} onChange={e => updateProfile(s.id, 'name', e.target.value)} style={{ ...cellInput, fontWeight: 700 }} />
                  </td>
                  <td>
                    <input type="text" value={s.bankName || ''} onChange={e => updateProfile(s.id, 'bankName', e.target.value)} placeholder="Bank Name" style={cellInput} />
                  </td>
                  <td>
                    <input type="text" value={s.bankBranch || ''} onChange={e => updateProfile(s.id, 'bankBranch', e.target.value)} placeholder="Branch" style={cellInput} />
                  </td>
                  <td>
                    <input type="text" value={s.accountNumber || ''} onChange={e => updateProfile(s.id, 'accountNumber', e.target.value)} placeholder="Account No." style={{ ...cellInput, fontFamily: 'monospace', letterSpacing: '1px' }} />
                  </td>
                  <td>
                    <input type="text" value={s.ifscCode || ''} onChange={e => updateProfile(s.id, 'ifscCode', e.target.value)} placeholder="IFSC" style={{ ...cellInput, textTransform: 'uppercase', fontFamily: 'monospace' }} />
                  </td>
                  <td>
                    <input type="text" value={s.bankHolderName || ''} onChange={e => updateProfile(s.id, 'bankHolderName', e.target.value)} placeholder="Holder Name" style={cellInput} />
                  </td>
                  <td style={{ fontWeight: 700 }}>₹ {fmt(netPay)}</td>
                  <td style={{ fontWeight: 800, color: '#1d4ed8', background: '#eff6ff' }}>₹ {fmt(netPay)}</td>
                </tr>
              );
            })}
            <tr className={styles.totalRow}>
              <td colSpan="7" style={{ textAlign: 'right', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Disbursement →</td>
              <td style={{ fontWeight: 700 }}>₹ {fmt(totalAmount)}</td>
              <td style={{ fontWeight: 800, color: '#1d4ed8' }}>₹ {fmt(totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BankPaymentTab;
