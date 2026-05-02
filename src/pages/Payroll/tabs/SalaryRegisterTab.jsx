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

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '';
    return '₹ ' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    const totalDeductions = fooding + advance;
    const netPayment = amount - totalDeductions;

    return { basicSalary, sundays, absent, working, cl, ot, holiday, workingDaysWithHoliday, amount, fooding, advance, totalDeductions, netPayment, record };
  };

  const totals = useMemo(() => {
    return allStaff.reduce((acc, s) => {
      const calc = calculateSalary(s);
      acc.amount += calc.amount;
      acc.fooding += calc.fooding;
      acc.advance += calc.advance;
      acc.totalDeductions += calc.totalDeductions;
      acc.netPayment += calc.netPayment;
      return acc;
    }, { amount: 0, fooding: 0, advance: 0, totalDeductions: 0, netPayment: 0 });
  }, [allStaff, selectedMonth, selectedYear, payroll, staffAttendance]);

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeader}>
        <h2 className={styles.reportTitle}>Salary Register</h2>
        <p className={styles.reportSubtitle}>{monthName} {selectedYear} • Editable Payroll Data</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.modernTable}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>No.</th>
              <th style={{ width: '220px' }}>Employee</th>
              <th style={{ width: '130px' }}>Designation</th>
              <th style={{ textAlign: 'right', width: '110px' }}>Base Salary</th>
              <th className={styles.calcCell} style={{ textAlign: 'center' }}>Total Days</th>
              <th className={styles.calcCell} style={{ textAlign: 'right', width: '110px' }}>Gross Amount</th>
              <th style={{ textAlign: 'center', width: '120px' }}>Fooding (D/R)</th>
              <th style={{ textAlign: 'right', width: '100px' }}>Advance</th>
              <th className={styles.calcCell} style={{ textAlign: 'right', width: '110px' }}>Total Ded.</th>
              <th className={styles.netPayCell} style={{ textAlign: 'right', width: '130px' }}>Net Payment</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map((s, index) => {
              const calc = calculateSalary(s);
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
                      placeholder="Name" 
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={s.role || s.designation || 'Staff'} 
                      onChange={e => updateProfile(s.id, 'role', e.target.value)} 
                      className={styles.editInput} 
                      style={{ fontSize: '0.85rem' }} 
                      placeholder="Role" 
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={s.baseSalary || s.salary || ''} 
                      onChange={e => updateProfile(s.id, 'baseSalary', e.target.value)} 
                      className={`${styles.editInput} ${styles.currency}`} 
                      placeholder="0" 
                    />
                  </td>
                  <td className={styles.calcCell} style={{ textAlign: 'center' }}>
                    <span title={`Working: ${calc.working}, Sun: ${calc.sundays}, Hol: ${calc.holiday}, CL: ${calc.cl}, OT: ${calc.ot}`}>
                      {calc.workingDaysWithHoliday} / {daysInMonth}
                    </span>
                  </td>
                  <td className={styles.calcCell} style={{ textAlign: 'right' }}>{formatCurrency(calc.amount)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input 
                        type="number" 
                        placeholder="Days" 
                        value={calc.record.foodingDays || ''} 
                        onChange={e => updatePayrollField(s.id, 'foodingDays', e.target.value)} 
                        className={styles.editInput} 
                        style={{ textAlign: 'center' }} 
                      />
                      <span style={{ color: '#94a3b8' }}>×</span>
                      <input 
                        type="number" 
                        placeholder="Rate" 
                        value={calc.record.foodingRate || ''} 
                        onChange={e => updatePayrollField(s.id, 'foodingRate', e.target.value)} 
                        className={styles.editInput} 
                        style={{ textAlign: 'center' }} 
                      />
                    </div>
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={calc.record.advance || ''} 
                      onChange={e => updatePayrollField(s.id, 'advance', e.target.value)} 
                      className={`${styles.editInput} ${styles.currency}`} 
                      placeholder="0" 
                    />
                  </td>
                  <td className={styles.calcCell} style={{ textAlign: 'right', color: calc.totalDeductions > 0 ? '#dc2626' : 'inherit' }}>
                    {calc.totalDeductions > 0 ? '-' : ''}{formatCurrency(calc.totalDeductions)}
                  </td>
                  <td className={styles.netPayCell} style={{ textAlign: 'right' }}>{formatCurrency(calc.netPayment)}</td>
                </tr>
              );
            })}
            <tr className={styles.totalRow}>
              <td colSpan="5" style={{ textAlign: 'right', textTransform: 'uppercase', letterSpacing: '1px' }}>Organization Totals</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(totals.amount)}</td>
              <td style={{ textAlign: 'center' }}>{formatCurrency(totals.fooding)}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(totals.advance)}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(totals.totalDeductions)}</td>
              <td className={styles.netPayCell} style={{ textAlign: 'right', fontSize: '1.1rem' }}>{formatCurrency(totals.netPayment)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryRegisterTab;
