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
    if (!val) return '';
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

  return (
    <div className={styles.salaryPrintArea}>
      <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
        <h1 className={styles.headerTitle} style={{ margin: 0, fontSize: '1.8rem' }}>KASHIBAI GANPAT COLLEGE</h1>
        <h3 style={{ margin: '5px 0', fontSize: '1rem', fontWeight: 'bold' }}>
          SALARY SLIP FOR THE MONTH OF {monthName.toUpperCase()} {selectedYear}
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.slipTable}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>S.NO</th>
              <th className={styles.nameCol} style={{ width: '200px' }}>NAME</th>
              <th style={{ width: '150px' }}>DESIGNATION</th>
              <th className={styles.verticalHeader}>BASIC E SALARY</th>
              <th className={styles.verticalHeader}>TOTAL SUNDAY</th>
              <th className={styles.verticalHeader}>HOLIDAY</th>
              <th className={styles.verticalHeader}>ABSENT</th>
              <th className={styles.verticalHeader}>WORKING</th>
              <th className={styles.verticalHeader}>C L</th>
              <th className={styles.verticalHeader}>WORKING DAY WITH<br/>HOLIDAY</th>
              <th style={{ minWidth: '100px' }}>AMOUNT</th>
              <th className={styles.verticalHeader}>FOODING</th>
              <th className={styles.verticalHeader}>ADVANCE</th>
              <th className={styles.verticalHeader}>TOTAL</th>
              <th className={styles.verticalHeader} style={{ minWidth: '80px' }}>NET PAYMENT</th>
              <th className={styles.verticalHeader}>TOTAL CASUAL</th>
              <th className={styles.verticalHeader}>TOTAL<br/>LEAVE USE</th>
              <th className={styles.verticalHeader}>THIS MONTH</th>
              <th className={styles.verticalHeader}>LEAVE BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map((s, index) => {
              const calc = calculateSalary(s);
              return (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td className={styles.nameCol}>
                    <input type="text" value={s.name} onChange={e => updateProfile(s.id, 'name', e.target.value)} className={styles.noPrint} style={{ border: 'none', background: 'transparent', fontWeight: 'bold', width: '100%', fontSize: '0.65rem' }} />
                    <span className="print-only" style={{ fontWeight: 'bold' }}>{s.name}</span>
                  </td>
                  <td>
                    <input type="text" value={s.role || s.designation || 'Staff'} onChange={e => updateProfile(s.id, 'role', e.target.value)} className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center', fontSize: '0.65rem', fontWeight: 'bold' }} />
                    <span className="print-only" style={{ fontWeight: 'bold' }}>{(s.role || s.designation || 'Staff').toUpperCase()}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className={styles.noPrint}>₹</span>
                      <input type="number" value={s.baseSalary || s.salary || 0} onChange={e => updateProfile(s.id, 'baseSalary', e.target.value)} className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '60px', textAlign: 'center', fontSize: '0.65rem' }} />
                      <span className="print-only" style={{ fontWeight: 'bold' }}>{formatCurrency(calc.basicSalary)}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{calc.sundays || ''}</td>
                  <td style={{ fontWeight: 'bold' }}>{calc.holiday || ''}</td>
                  <td style={{ fontWeight: 'bold' }}>{calc.absent || ''}</td>
                  <td style={{ fontWeight: 'bold' }}>{calc.working || ''}</td>
                  <td style={{ fontWeight: 'bold' }}>{calc.cl || ''}</td>
                  <td style={{ fontWeight: 'bold' }}>{calc.workingDaysWithHoliday || ''}</td>
                  <td style={{ fontWeight: 'bold' }}>{formatCurrency(calc.amount)}</td>
                  <td className={styles.noPrint}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <input type="number" placeholder="Days" value={calc.record.foodingDays || ''} onChange={e => updatePayrollField(s.id, 'foodingDays', e.target.value)} style={{ width: '45px', fontSize: '0.65rem', padding: '2px' }} />
                      <input type="number" placeholder="Rate" value={calc.record.foodingRate || ''} onChange={e => updatePayrollField(s.id, 'foodingRate', e.target.value)} style={{ width: '45px', fontSize: '0.65rem', padding: '2px' }} />
                    </div>
                  </td>
                  <td className="print-only" style={{ fontWeight: 'bold' }}>{formatCurrency(calc.fooding)}</td>
                  <td>
                    <input type="number" value={calc.record.advance || ''} onChange={e => updatePayrollField(s.id, 'advance', e.target.value)} className={styles.noPrint} style={{ border: 'none', background: 'transparent', width: '60px', textAlign: 'center', fontSize: '0.65rem' }} />
                    <span className="print-only" style={{ fontWeight: 'bold' }}>{formatCurrency(calc.advance)}</span>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{formatCurrency(calc.total)}</td>
                  <td style={{ fontWeight: 'bold' }}>{formatCurrency(calc.netPayment)}</td>
                  <td>21</td>
                  <td>{calc.cl || ''}</td>
                  <td>{calc.cl || ''}</td>
                  <td>{21 - (calc.cl || 0)}</td>
                </tr>
              );
            })}
            <tr className={styles.totalRow} style={{ fontSize: '0.75rem' }}>
              <td colSpan="10" style={{ border: 'none' }}></td>
              <td style={{ fontWeight: 'bold' }}>{formatCurrency(totals.amount)}</td>
              <td style={{ fontWeight: 'bold' }}>{formatCurrency(totals.fooding)}</td>
              <td style={{ fontWeight: 'bold' }}>{formatCurrency(totals.advance)}</td>
              <td style={{ fontWeight: 'bold' }}>{formatCurrency(totals.total)}</td>
              <td style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{formatCurrency(totals.netPayment)}</td>
              <td colSpan="4" style={{ border: 'none' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
         <div style={{ border: '1px solid #000', padding: '5px 10px', fontSize: '0.9rem', width: '300px', textAlign: 'center' }}>
            NET PAYMENT-  {totals.netPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
         </div>
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
      <style>{`
        @media screen { .print-only { display: none; } }
        @media print { .print-only { display: inline; } .no-print { display: none !important; } }
      `}</style>
    </div>
  );
};

export default SalaryRegisterTab;
