import React, { useContext, useState } from 'react';
import { Wallet, PieChart, Plus, FileText } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import ReportExportModal from '../../components/ReportExportModal/ReportExportModal';
import AddEntryModal from '../../components/AddEntryModal';
import ModuleGuide from '../../components/ModuleGuide';
const Finance = () => {
  const { finance, addExpense, currentUser, addLoan, refillPettyCash, faculty, staff } = useContext(AppContext);
  const [showReports, setShowReports] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [modalType, setModalType] = useState(null); // 'expense' | 'loan' | 'refill'


  const getFields = () => {
    switch (modalType) {
      case 'expense':
        return [
          { name: 'description', label: 'Description', required: true, placeholder: 'e.g. Office Supplies' },
          { name: 'amount', label: 'Amount (₹)', type: 'number', required: true, placeholder: 'e.g. 1500' },
          { name: 'category', label: 'Category', required: true, placeholder: 'e.g. Supplies' }
        ];
      case 'loan':
        const allEmployees = [...(faculty || []), ...(staff || [])];
        return [
          { 
            name: 'employeeId', 
            label: 'Employee', 
            type: 'select', 
            required: true, 
            options: allEmployees.map(e => ({ value: e.id, label: `${e.name} (${e.id})` })) 
          },
          { name: 'type', label: 'Loan Type', required: true, placeholder: 'e.g. Advance Salary' },
          { name: 'amount', label: 'Total Amount (₹)', type: 'number', required: true, placeholder: 'e.g. 50000' },
          { name: 'installment', label: 'Monthly Installment (₹)', type: 'number', required: true, placeholder: 'e.g. 5000' }
        ];
      case 'refill':
        return [
          { name: 'amount', label: 'Refill Amount (₹)', type: 'number', required: true, placeholder: 'e.g. 10000' }
        ];
      default:
        return [];
    }
  };

  const handleModalSave = (data) => {
    if (modalType === 'expense') {
      addExpense({ ...data, amount: Number(data.amount), date: new Date().toISOString().split('T')[0] });
    } else if (modalType === 'loan') {
      addLoan({ 
        ...data, 
        amount: Number(data.amount), 
        remaining: Number(data.amount), 
        installment: Number(data.installment), 
        status: 'Active' 
      });
    } else if (modalType === 'refill') {
      refillPettyCash(data.amount);
    }
    setModalType(null);
  };


  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleGuide 
        role={currentUser?.role}
        adminText="Manage petty cash, record institutional expenses, and track employee loans/advances."
        staffText="View financial policies and request petty cash refills or advances if authorized."
      />
      <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Finance Management System</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Automate expenses, petty cash, and statutory compliance.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {currentUser?.role !== 'Management' && (
            <>
              <button onClick={() => setModalType('expense')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                <Plus size={18} /> Record Expense
              </button>
              <button onClick={() => setModalType('loan')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f59e0b', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                <Plus size={18} /> Add Loan
              </button>
            </>
          )}
          <button onClick={() => setShowReports(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <FileText size={18} /> Reports
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        {['Overview', 'Loans & Advances'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab.toLowerCase() === 'overview' ? 'overview' : 'loans')}
            style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: (activeTab === 'overview' && tab === 'Overview') || (activeTab === 'loans' && tab === 'Loans & Advances') ? '2px solid var(--primary)' : 'none', color: (activeTab === 'overview' && tab === 'Overview') || (activeTab === 'loans' && tab === 'Loans & Advances') ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          <Card style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', opacity: 0.9 }}>
              <Wallet size={20} /> <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500 }}>Petty Cash Balance</h2>
            </div>
            <h1 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0', fontWeight: 700 }}>₹{finance?.pettyCash?.balance?.toLocaleString() || '0'}</h1>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.875rem' }}>Last Refill: {finance?.pettyCash?.lastRefill || 'Never'}</p>
            
            {currentUser?.role !== 'Management' && (
              <button 
                onClick={() => setModalType('refill')}
                style={{ marginTop: '2rem', width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Request Refill
              </button>
            )}
          </Card>

          <Card style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <PieChart size={20} color="var(--primary)" /> 
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Recent Project Expenses</h2>
            </div>
            
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    <th style={{ padding: '0.75rem' }}>Transaction ID</th>
                    <th style={{ padding: '0.75rem' }}>Description</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {finance?.expenses?.map(exp => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{exp.id}</td>
                      <td style={{ padding: '1rem 0.75rem', color: 'var(--text-primary)' }}>{exp.description}</td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', background: 'var(--surface-hover)', borderRadius: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {exp.category}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: '#d32f2f' }}>₹{exp.amount?.toLocaleString()}</td>
                      <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{exp.date}</td>
                    </tr>
                  ))}
                  {(!finance?.expenses || finance.expenses.length === 0) && (
                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent expenses.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'loans' && (
        <Card style={{ padding: '1.5rem' }}>
           <h2 style={{ marginBottom: '1.5rem' }}>Loans & Advances Tracking</h2>
            <div className="table-responsive">
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                     <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <th style={{ padding: '0.75rem' }}>ID</th>
                        <th style={{ padding: '0.75rem' }}>Employee ID</th>
                        <th style={{ padding: '0.75rem' }}>Type</th>
                        <th style={{ padding: '0.75rem' }}>Total Amount</th>
                        <th style={{ padding: '0.75rem' }}>Remaining</th>
                        <th style={{ padding: '0.75rem' }}>Installment</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {finance?.loans?.map(loan => (
                        <tr key={loan.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                           <td style={{ padding: '1rem 0.75rem' }}>{loan.id}</td>
                           <td style={{ padding: '1rem 0.75rem' }}>{loan.employeeId}</td>
                           <td style={{ padding: '1rem 0.75rem' }}>{loan.type}</td>
                           <td style={{ padding: '1rem 0.75rem' }}>₹{loan.amount.toLocaleString()}</td>
                           <td style={{ padding: '1rem 0.75rem', color: '#d32f2f' }}>₹{loan.remaining.toLocaleString()}</td>
                           <td style={{ padding: '1rem 0.75rem' }}>₹{loan.installment.toLocaleString()}</td>
                           <td style={{ padding: '1rem 0.75rem' }}>
                              <span style={{ padding: '0.25rem 0.5rem', background: '#e3f2fd', color: '#1976d2', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>{loan.status}</span>
                           </td>
                        </tr>
                     ))}
                     {(!finance?.loans || finance.loans.length === 0) && (
                        <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No active loans found.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
        </Card>
      )}


      <ReportExportModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        title="Finance Expense"
        data={finance?.expenses || []}
        columns={[
          { key: 'id', label: 'Transaction ID' },
          { key: 'description', label: 'Description' },
          { key: 'category', label: 'Category' },
          { key: 'amount', label: 'Amount' },
          { key: 'date', label: 'Date' }
        ]}
        filters={[
          { key: 'category', label: 'Category', options: Array.from(new Set(finance?.expenses?.map(e => e.category) || [])).filter(Boolean).map(c => ({ value: c, label: c })) }
        ]}
      />

      <AddEntryModal 
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        onSave={handleModalSave}
        title={modalType === 'refill' ? 'Petty Cash Refill' : modalType === 'loan' ? 'New Loan/Advance' : 'Record New Expense'}
        fields={getFields()}
      />
    </div>
  );
};

export default Finance;
