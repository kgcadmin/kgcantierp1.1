import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

const SalaryRegisterTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, calendar, payroll, setPayroll, syncToVPS, editFaculty, editStaff } = useContext(AppContext);
  
  const allStaff = useMemo(() => [...faculty, ...staff], [faculty, staff]);
  const daysInMonth = useMemo(() => new Date(selectedYear, selectedMonth + 1, 0).getDate(), [selectedMonth, selectedYear]);
  const monthName = useMemo(() => new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }), [selectedMonth, selectedYear]);
  const monthKey = `${monthName} ${selectedYear}`;

  const updateProfile = (id, field, value) => {
    const isFaculty = faculty.some(f => f.id === id);
    const val = field === 'baseSalary' ? Number(value) : value;
    if (isFaculty) editFaculty(id, { [field]: val });
    else editStaff(id, { [field]: val });
  };

  const getAttendanceData = (memberId) => {
    let working = 0;
    let sundays = 0;
    let absent = 0;
    let cl = 0;
    let holiday = 0;
    let ot = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(selectedYear, selectedMonth, d).getDay();
      const record = staffAttendance.find(a => a.memberId === memberId && a.date === dateStr);
      const status = record?.status;
      const isHoliday = calendar.find(c => c.date === dateStr && (c.type === 'Holiday' || c.category === 'Holiday'));

      if (status === 'P') working++;
      else if (status === 'A') absent++;
      else if (status === 'CL') cl++;
      else if (status === 'OT') ot++;
      else if (status === 'H' || (!status && isHoliday)) holiday++;
      else if (status === 'SUN' || (!status && dayOfWeek === 0)) sundays++;
    }
    return { working, sundays, absent, cl, holiday, ot };
  };

  const updatePayrollField = (memberId, field, value) => {
    const existingIndex = payroll.findIndex(p => p.employeeId === memberId && p.month === monthKey);
    let updatedPayroll = [...payroll];
    let record;

    if (existingIndex >= 0) {
      record = { ...updatedPayroll[existingIndex], [field]: Number(value) };
      updatedPayroll[existingIndex] = record;
    } else {
      record = { 
        id: `PAY${Date.now()}${memberId}`, 
        employeeId: memberId, 
        month: monthKey, 
        [field]: Number(value),
        foodingRate: 30,
        foodingDays: 0,
        advance: 0
      };
      updatedPayroll.push(record);
    }
    
    if (field === 'foodingDays' || field === 'foodingRate') {
      record.fooding = (record.foodingDays || 0) * (record.foodingRate || 0);
    }

    setPayroll(updatedPayroll);
    syncToVPS('payroll', record, record.id, existingIndex >= 0 ? 'PUT' : 'POST');
  };

  const calculateSalary = (staffMember) => {
    const { working, sundays, absent, cl, holiday, ot } = getAttendanceData(staffMember.id);
    const basicSalary = Number(staffMember.baseSalary || staffMember.salary || 10000);
    const workingDaysWithHoliday = working + sundays + holiday + cl + ot;
    const amount = Math.round((basicSalary / daysInMonth) * workingDaysWithHoliday);
    const record = payroll.find(p => p.employeeId === staffMember.id && p.month === monthKey) || {};
    const fooding = record.fooding || 0;
    const advance = record.advance || 0;
    const netPayment = amount - fooding - advance;

    return { basicSalary, sundays, absent, working, cl, ot, holiday, workingDaysWithHoliday, amount, fooding, advance, netPayment, record };
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
  }, [allStaff, selectedMonth, selectedYear, payroll, staffAttendance]);

  return (
    <div className={styles.salaryPrintArea}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>KASHIBAI GANPAT COLLEGE</h2>
        <h3 style={{ margin: '0.2rem 0', fontSize: '1.1rem', textDecoration: 'underline' }}>
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
              <th>SUN/HOL</th>
              <th>ABSENT</th>
              <th>WORK</th>
              <th>C.L</th>
              <th>W.D.W.H</th>
              <th>AMOUNT</th>
              <th>FOODING</th>
              <th>ADVANCE</th>
              <th>TOTAL DED.</th>
              <th>NET PAYMENT</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map((s, index) => {
              const calc = calculateSalary(s);
              return (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td className={styles.nameCol}>
                    <input type="text" value={s.name} onChange={e => updateProfile(s.id, 'name', e.target.value)} className={styles.noPrint} style={{ border: 'none', background: 'transparent', fontWeight: 600, width: '100%', fontSize: '0.75rem' }} />
                    <span className="print-only" style={{ fontWeight: 600 }}>{s.name}</span>
                  </td>
                  <td>
                    <input type="text" value={s.role || s.designation || 'Staff'} onChange={e => updateProfile(s.id, 'role', e.target.value)} className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center', fontSize: '0.65rem' }} />
                    <span className="print-only">{(s.role || s.designation || 'Staff').toUpperCase()}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span>₹</span>
                      <input type="number" value={s.baseSalary || s.salary || 0} onChange={e => updateProfile(s.id, 'baseSalary', e.target.value)} className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '60px', textAlign: 'center', fontSize: '0.75rem' }} />
                      <span className="print-only">{calc.basicSalary.toLocaleString()}</span>
                    </div>
                  </td>
                  <td>{calc.sundays + calc.holiday}</td>
                  <td style={{ color: calc.absent > 0 ? '#ef4444' : 'inherit' }}>{calc.absent}</td>
                  <td>{calc.working}</td>
                  <td>{calc.cl}</td>
                  <td style={{ fontWeight: 700 }}>{calc.workingDaysWithHoliday}</td>
                  <td style={{ fontWeight: 600 }}>₹{calc.amount.toLocaleString()}</td>
                  <td className={styles.noPrint}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <input type="number" placeholder="Days" value={calc.record.foodingDays || ''} onChange={e => updatePayrollField(s.id, 'foodingDays', e.target.value)} style={{ width: '45px', fontSize: '0.75rem', padding: '2px' }} />
                      <input type="number" placeholder="Rate" value={calc.record.foodingRate || ''} onChange={e => updatePayrollField(s.id, 'foodingRate', e.target.value)} style={{ width: '45px', fontSize: '0.75rem', padding: '2px' }} />
                    </div>
                  </td>
                  <td className="print-only">₹{calc.fooding}</td>
                  <td>
                    <input type="number" value={calc.record.advance || ''} onChange={e => updatePayrollField(s.id, 'advance', e.target.value)} className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '60px', textAlign: 'center', fontSize: '0.85rem' }} />
                    <span className="print-only">₹{calc.advance.toLocaleString()}</span>
                  </td>
                  <td style={{ color: '#ef4444' }}>₹{(calc.fooding + calc.advance).toLocaleString()}</td>
                  <td style={{ fontWeight: 800, background: '#f8f9fa' }}>₹{calc.netPayment.toLocaleString()}</td>
                </tr>
              );
            })}
            <tr className={styles.totalRow}>
              <td colSpan="9" style={{ textAlign: 'right', paddingRight: '1rem' }}>TOTALS</td>
              <td>₹{totals.amount.toLocaleString()}</td>
              <td>₹{totals.fooding.toLocaleString()}</td>
              <td>₹{totals.advance.toLocaleString()}</td>
              <td style={{ color: '#ef4444' }}>₹{(totals.fooding + totals.advance).toLocaleString()}</td>
              <td style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>₹{totals.netPayment.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <div style={{ textAlign: 'center' }}>
           <div style={{ width: '150px', borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '40px' }}></div>
           <p style={{ margin: 0, fontWeight: 700 }}>Checked By</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0 }}>For</p>
          <p style={{ margin: 0, fontWeight: 800 }}>PRINCIPAL</p>
          <p style={{ margin: 0, fontSize: '0.75rem' }}>KASHIBAI GANPAT NURSING COLLEGE</p>
        </div>
        <div style={{ textAlign: 'center' }}>
           <div style={{ width: '150px', borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '40px' }}></div>
           <p style={{ margin: 0, fontWeight: 700 }}>Managing Director</p>
        </div>
      </div>
      <style>{`
        @media screen { .print-only { display: none; } }
        @media print { .print-only { display: inline; } .no-print { display: none !important; } }
      `}</style>
    </div>
  );
};

export default SalaryRegisterTab;
