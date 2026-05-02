import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import styles from '../SalarySlip.module.css';

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

const SalaryRegisterTab = ({ selectedMonth, selectedYear }) => {
  const { faculty, staff, staffAttendance, calendar, payroll, setPayroll, syncToVPS, editFaculty, editStaff } = useContext(AppContext);
  
  const allStaff = useMemo(() => [...faculty, ...staff], [faculty, staff]);
  
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const monthName = useMemo(() => {
    return new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });
  }, [selectedMonth, selectedYear]);

  const monthKey = `${monthName} ${selectedYear}`;

  const updateProfile = (id, field, value) => {
    const isFaculty = faculty.some(f => f.id === id);
    const val = field === 'baseSalary' ? Number(value) : value;
    if (isFaculty) editFaculty(id, { [field]: val });
    else editStaff(id, { [field]: val });
  };

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '';
    return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getAttendanceData = (memberId) => {
    let working = 0, sundays = 0, absent = 0, cl = 0, holiday = 0, ot = 0;
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

  // Simplified: just store fooding as a direct amount, advance as a direct amount
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
        fooding: 0,
        advance: 0
      };
      updatedPayroll.push(record);
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
    // Fooding is now a direct amount, no calculation
    const fooding = record.fooding || 0;
    const advance = record.advance || 0;
    const total = fooding + advance;
    const netPayment = amount - total;
    return { basicSalary, sundays, absent, working, cl, ot, holiday, workingDaysWithHoliday, amount, fooding, advance, total, netPayment, record };
  };

  const totals = useMemo(() => {
    return allStaff.reduce((acc, s) => {
      const calc = calculateSalary(s);
      acc.amount += calc.amount;
      acc.fooding += calc.fooding;
      acc.advance += calc.advance;
      acc.total += calc.total;
      acc.netPayment += calc.netPayment;
      return acc;
    }, { amount: 0, fooding: 0, advance: 0, total: 0, netPayment: 0 });
  }, [allStaff, selectedMonth, selectedYear, payroll, staffAttendance]);

  // Shared input style — clean white background so text is always readable
  const inputStyle = {
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '4px',
    padding: '3px 6px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  };

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.15)';
  };
  const inputBlurHandler = (e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className={styles.salaryPrintArea}>
      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 className={styles.headerTitle} style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>KASHIBAI GANPAT COLLEGE</h1>
        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.5px' }}>VILL - CHAKME, (THAKUR GAON) BURMU, RANCHI- 835205</p>
        <h3 style={{ margin: '1rem 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
          SALARY SLIP FOR THE MONTH OF {monthName.toUpperCase()} {selectedYear}
        </h3>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.slipTable}>
          <thead>
            <tr>
              <th style={{ width: '36px' }}>S.NO</th>
              <th className={styles.nameCol} style={{ width: '160px' }}>NAME</th>
              <th style={{ width: '120px' }}>DESIGNATION</th>
              <th className={styles.verticalHeader}>BASIC SALARY</th>
              <th className={styles.verticalHeader}>TOTAL SUNDAY</th>
              <th className={styles.verticalHeader}>HOLIDAY</th>
              <th className={styles.verticalHeader}>ABSENT</th>
              <th className={styles.verticalHeader}>WORKING</th>
              <th className={styles.verticalHeader}>C L</th>
              <th className={styles.verticalHeader}>WORKING DAY WITH HOLIDAY</th>
              <th style={{ minWidth: '90px' }}>AMOUNT</th>
              <th style={{ minWidth: '90px' }}>FOODING</th>
              <th style={{ minWidth: '90px' }}>ADVANCE</th>
              <th className={styles.verticalHeader}>TOTAL</th>
              <th style={{ minWidth: '90px' }}>NET PAYMENT</th>
              <th className={styles.verticalHeader}>TOTAL CL</th>
              <th className={styles.verticalHeader}>LEAVE THIS MONTH</th>
              <th className={styles.verticalHeader}>LEAVE BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map((s, index) => {
              const calc = calculateSalary(s);
              return (
                <tr key={s.id}>
                  <td style={{ color: '#64748b' }}>{index + 1}</td>

                  {/* Name */}
                  <td className={styles.nameCol}>
                    <input type="text" value={s.name} onChange={e => updateProfile(s.id, 'name', e.target.value)}
                      style={{ ...cellInput, fontWeight: 700 }} />
                  </td>

                  <td>
                    <input type="text" value={s.role || s.designation || 'Staff'} onChange={e => updateProfile(s.id, 'role', e.target.value)}
                      style={{ ...cellInput, textAlign: 'center' }} />
                  </td>

                  <td>
                    <input type="number" value={s.baseSalary || s.salary || 0} onChange={e => updateProfile(s.id, 'baseSalary', e.target.value)}
                      style={{ ...cellInput, textAlign: 'right', width: '80px' }} />
                  </td>

                  {/* Auto-calculated attendance columns */}
                  <td style={{ fontWeight: 600 }}>{calc.sundays || ''}</td>
                  <td style={{ fontWeight: 600 }}>{calc.holiday || ''}</td>
                  <td style={{ fontWeight: 600, color: calc.absent > 0 ? '#ef4444' : 'inherit' }}>{calc.absent || ''}</td>
                  <td style={{ fontWeight: 600 }}>{calc.working || ''}</td>
                  <td style={{ fontWeight: 600 }}>{calc.cl || ''}</td>
                  <td style={{ fontWeight: 700, background: '#f8fafc' }}>{calc.workingDaysWithHoliday || ''}</td>

                  {/* Gross Amount */}
                  <td style={{ fontWeight: 700, background: '#f8fafc' }}>{formatCurrency(calc.amount)}</td>

                  {/* Fooding — direct amount input */}
                  <td>
                    <input type="number" value={calc.record.fooding ?? ''} onChange={e => updatePayrollField(s.id, 'fooding', e.target.value)}
                      style={{ ...cellInput, textAlign: 'right', width: '80px' }} placeholder="0" />
                  </td>

                  {/* Advance */}
                  <td>
                    <input type="number" value={calc.record.advance ?? ''} onChange={e => updatePayrollField(s.id, 'advance', e.target.value)}
                      style={{ ...cellInput, textAlign: 'right', width: '80px' }} placeholder="0" />
                  </td>

                  {/* Total deductions */}
                  <td style={{ fontWeight: 700, color: calc.total > 0 ? '#ef4444' : 'inherit' }}>{formatCurrency(calc.total)}</td>

                  {/* Net Payment */}
                  <td style={{ fontWeight: 800, background: '#eff6ff', color: '#1d4ed8' }}>{formatCurrency(calc.netPayment)}</td>

                  {/* CL columns */}
                  <td>21</td>
                  <td>{calc.cl || ''}</td>
                  <td>{calc.cl || ''}</td>
                  <td style={{ fontWeight: 600 }}>{21 - (calc.cl || 0)}</td>
                </tr>
              );
            })}

            {/* Totals row */}
            <tr className={styles.totalRow}>
              <td colSpan="10" style={{ border: 'none', textAlign: 'right', paddingRight: '0.5rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Totals →</td>
              <td style={{ fontWeight: 700 }}>{formatCurrency(totals.amount)}</td>
              <td style={{ fontWeight: 700 }}>{formatCurrency(totals.fooding)}</td>
              <td style={{ fontWeight: 700 }}>{formatCurrency(totals.advance)}</td>
              <td style={{ fontWeight: 700, color: '#ef4444' }}>{formatCurrency(totals.total)}</td>
              <td style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '0.85rem' }}>{formatCurrency(totals.netPayment)}</td>
              <td colSpan="4" style={{ border: 'none' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Net Payment Summary ── */}
      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', borderRadius: '6px', padding: '8px 20px', fontSize: '0.95rem', textAlign: 'center', fontWeight: 700, color: '#1d4ed8', minWidth: '300px' }}>
          NET PAYMENT — ₹ {totals.netPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

export default SalaryRegisterTab;
