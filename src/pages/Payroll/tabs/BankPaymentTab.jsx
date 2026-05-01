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

  const totalAmount = useMemo(() => {
    return allStaff.reduce((sum, s) => sum + calculateNetPayment(s), 0);
  }, [allStaff, selectedMonth, selectedYear, payroll, staffAttendance]);

  return (
    <div className={styles.salaryPrintArea}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>KASHIBAI GANPAT COLLEGE</h2>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>VILL - CHAKME, [THAKUR GAON] BURMU, RANCHI-835205</p>
        <h3 style={{ margin: '0.5rem 0', fontSize: '1rem', textDecoration: 'underline' }}>
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
                    <input type="text" value={s.name} onChange={e => updateProfile(s.id, 'name', e.target.value)} className={styles.noPrint} style={{ border: 'none', background: 'transparent', fontWeight: 600, width: '100%', fontSize: '0.75rem' }} />
                    <span className="print-only" style={{ fontWeight: 600 }}>{s.name}</span>
                  </td>
                  <td>
                    <input type="text" value={s.bankName || ''} onChange={e => updateProfile(s.id, 'bankName', e.target.value)} placeholder="Enter Bank" className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center', fontSize: '0.65rem' }} />
                    <span className="print-only">{s.bankName}</span>
                  </td>
                  <td>
                    <input type="text" value={s.bankBranch || ''} onChange={e => updateProfile(s.id, 'bankBranch', e.target.value)} placeholder="Enter Branch" className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center', fontSize: '0.65rem' }} />
                    <span className="print-only">{s.bankBranch}</span>
                  </td>
                  <td>
                    <input type="text" value={s.accountNumber || ''} onChange={e => updateProfile(s.id, 'accountNumber', e.target.value)} placeholder="Account No" className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center', fontSize: '0.75rem', letterSpacing: '0.5px' }} />
                    <span className="print-only">{s.accountNumber}</span>
                  </td>
                  <td>
                    <input type="text" value={s.ifscCode || ''} onChange={e => updateProfile(s.id, 'ifscCode', e.target.value)} placeholder="IFSC" className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center', fontSize: '0.65rem' }} />
                    <span className="print-only">{s.ifscCode}</span>
                  </td>
                  <td>
                    <input type="text" value={s.bankHolderName || s.name} onChange={e => updateProfile(s.id, 'bankHolderName', e.target.value)} placeholder="Holder Name" className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center', fontSize: '0.7rem' }} />
                    <span className="print-only">{s.bankHolderName || s.name}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{netPay.toLocaleString()}</td>
                </tr>
              );
            })}
            <tr className={styles.totalRow}>
              <td colSpan="7" style={{ textAlign: 'right', paddingRight: '1rem', fontWeight: 800 }}>TOTAL AMOUNT TO BE DISBURSED</td>
              <td style={{ fontSize: '1.1rem' }}>₹{totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px' }}></div>
          <p style={{ borderTop: '1px solid #000', width: '150px', paddingTop: '0.5rem', fontWeight: 700 }}>Checked By</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px' }}></div>
          <p style={{ borderTop: '1px solid #000', width: '150px', paddingTop: '0.5rem', fontWeight: 700 }}>Principal</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px' }}></div>
          <p style={{ borderTop: '1px solid #000', width: '150px', paddingTop: '0.5rem', fontWeight: 700 }}>Managing Director</p>
        </div>
      </div>
      <style>{`
        @media screen { .print-only { display: none; } }
        @media print { .print-only { display: inline; } .no-print { display: none !important; } }
      `}</style>
    </div>
  );
};

export default BankPaymentTab;
