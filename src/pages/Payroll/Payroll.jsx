import React, { useContext, useState } from 'react';
import { Users, FileText, Download, Calendar, Trash2 } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import ReportExportModal from '../../components/ReportExportModal/ReportExportModal';

const Payroll = () => {
  const { 
    payroll, leaves, faculty, staff, 
    approveLeave, requestLeave, addPayroll, 
    deletePayroll, deleteLeave, currentUser 
  } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('salary');
  const [showReports, setShowReports] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ employeeId: '', baseSalary: '', allowances: '', deductions: '', month: 'April 2026' });

  const getEmployeeName = (id) => {
    const emp = [...faculty, ...staff].find(e => e.id === id);
    return emp?.name || id;
  };

  const handleExport = () => {
    window.print();
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    const netPay = Number(newEntry.baseSalary) + Number(newEntry.allowances) - Number(newEntry.deductions);
    addPayroll({ 
      ...newEntry, 
      baseSalary: Number(newEntry.baseSalary), 
      allowances: Number(newEntry.allowances), 
      deductions: Number(newEntry.deductions), 
      netPay, 
      status: 'Processed' 
    });
    setShowEntryModal(false);
    setNewEntry({ employeeId: '', baseSalary: '', allowances: '', deductions: '', month: 'April 2026' });
    alert("Payroll entry added successfully!");
  };

  const relevantPayroll = currentUser?.role === 'Faculty' ? payroll.filter(p => p.employeeId === currentUser.linkedId) : payroll;
  const relevantLeaves = currentUser?.role === 'Faculty' ? leaves.filter(l => l.employeeId === currentUser.linkedId) : leaves;

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Payroll & HRMS Management</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Automate payroll processing, leave management, and employee info.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {activeTab === 'salary' && currentUser?.role !== 'Faculty' && currentUser?.role !== 'Student' && (
            <button onClick={() => setShowEntryModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#388e3c', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              + New Entry
            </button>
          )}
          {activeTab === 'leaves' && currentUser?.role === 'Faculty' && (
            <button onClick={() => {
              const type = window.prompt("Enter Leave Type (Sick, Casual, Earned):");
              const days = window.prompt("Enter Number of Days:");
              if (type && days) {
                requestLeave({ employeeId: currentUser.linkedId, type, days: Number(days), status: 'Pending' });
              }
            }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#388e3c', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              Request Leave
            </button>
          )}
          <button onClick={() => setShowReports(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <FileText size={18} /> Reports
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('salary')}
          style={{ background: 'none', border: 'none', color: activeTab === 'salary' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'salary' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem' }}
        ><Users size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> Salary Processing</button>
        
        <button 
          onClick={() => setActiveTab('leaves')}
          style={{ background: 'none', border: 'none', color: activeTab === 'leaves' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'leaves' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem' }}
        ><Calendar size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> Leave Management</button>
      </div>

      {activeTab === 'salary' && (
        <Card style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>April 2026 Payroll</h2>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '0.75rem' }}>Employee</th>
                  <th style={{ padding: '0.75rem' }}>Base Salary</th>
                  <th style={{ padding: '0.75rem' }}>Allowances</th>
                  <th style={{ padding: '0.75rem' }}>Deductions</th>
                  <th style={{ padding: '0.75rem' }}>Net Pay</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {relevantPayroll.map(pay => (
                  <tr key={pay.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{getEmployeeName(pay.employeeId)}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>₹{pay.baseSalary}</td>
                    <td style={{ padding: '1rem 0.75rem', color: '#388e3c' }}>+₹{pay.allowances}</td>
                    <td style={{ padding: '1rem 0.75rem', color: '#d32f2f' }}>-₹{pay.deductions}</td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>₹{pay.netPay}</td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                      {currentUser?.role === 'Admin' && (
                        <button onClick={() => deletePayroll(pay.id)} style={{ padding: '0.4rem', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.25rem', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'leaves' && (
        <Card style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Leave Requests</h2>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '0.75rem' }}>Employee</th>
                  <th style={{ padding: '0.75rem' }}>Leave Type</th>
                  <th style={{ padding: '0.75rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {relevantLeaves.map(leave => (
                  <tr key={leave.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{getEmployeeName(leave.employeeId)}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{leave.type}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{leave.days} Days</td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: leave.status === 'Approved' ? '#e8f5e9' : '#fff3e0',
                        color: leave.status === 'Approved' ? '#2e7d32' : '#e65100'
                      }}>
                        {leave.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {leave.status === 'Pending' && currentUser?.role !== 'Faculty' && (
                          <button onClick={() => approveLeave(leave.id)} style={{ padding: '0.25rem 0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>Approve</button>
                        )}
                        {currentUser?.role === 'Admin' && (
                          <button onClick={() => deleteLeave(leave.id)} style={{ padding: '0.4rem', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ReportExportModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        title="Payroll"
        data={relevantPayroll.map(p => {
          const emp = [...faculty, ...staff].find(e => e.id === p.employeeId) || {};
          return { 
            ...p, 
            employeeName: emp.name || p.employeeId,
            department: emp.department || 'Unknown',
            role: emp.role || 'Unknown'
          };
        })}
        columns={[
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'employeeName', label: 'Employee Name' },
          { key: 'role', label: 'Staff Type' },
          { key: 'department', label: 'Department' },
          { key: 'baseSalary', label: 'Base Salary' },
          { key: 'allowances', label: 'Allowances' },
          { key: 'deductions', label: 'Deductions' },
          { key: 'netPay', label: 'Net Pay' },
          { key: 'status', label: 'Status' }
        ]}
        filters={[
          { key: 'status', label: 'Status', options: Array.from(new Set(relevantPayroll.map(p => p.status))).filter(Boolean).map(s => ({ value: s, label: s })) },
          { key: 'role', label: 'Staff Type', options: Array.from(new Set(faculty.map(f => f.role))).filter(Boolean).map(r => ({ value: r, label: r })) },
          { key: 'department', label: 'Department', options: Array.from(new Set(faculty.map(f => f.department))).filter(Boolean).map(d => ({ value: d, label: d })) },
          { key: 'month', label: 'Month', options: Array.from(new Set(relevantPayroll.map(p => p.month))).filter(Boolean).map(m => ({ value: m, label: m })) }
        ]}
      />

      {showEntryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '500px', padding: '2rem', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 1.5rem 0' }}>Add Payroll Entry</h2>
            <form onSubmit={handleAddEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Select Employee</label>
                <select 
                  required
                  value={newEntry.employeeId} 
                  onChange={(e) => setNewEntry({...newEntry, employeeId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }}
                >
                  <option value="">Choose Faculty/Staff...</option>
                  {[...faculty, ...staff].map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Base Salary</label>
                  <input type="number" required value={newEntry.baseSalary} onChange={(e) => setNewEntry({...newEntry, baseSalary: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Allowances</label>
                  <input type="number" required value={newEntry.allowances} onChange={(e) => setNewEntry({...newEntry, allowances: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Deductions</label>
                  <input type="number" required value={newEntry.deductions} onChange={(e) => setNewEntry({...newEntry, deductions: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Month</label>
                  <input type="text" required value={newEntry.month} onChange={(e) => setNewEntry({...newEntry, month: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEntryModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--surface)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '0.4rem', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Save Entry</button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Payroll;
