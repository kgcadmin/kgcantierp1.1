import React, { useContext, useState } from 'react';
import { Search, Plus, CreditCard, Clock, CheckCircle, X, Settings, Calculator, FileText, Download, Trash2 } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import AddEntryModal from '../../components/AddEntryModal';

const Fees = () => {
  const { fees, students, addFee, deleteFee, feeStructures, addFeeStructure, courses, batches, enrollments, departments, currentUser } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showStructuresModal, setShowStructuresModal] = useState(false);
  const [showDuesModal, setShowDuesModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [reportFilters, setReportFilters] = useState({ departmentId: '', courseId: '', batchId: '', status: 'All' });
  const [duesResult, setDuesResult] = useState(null);
  const [breakdownItems, setBreakdownItems] = useState([{ type: 'Tuition', amount: '' }]);

  const relevantFees = currentUser?.role === 'Student' ? fees.filter(f => f.studentId === currentUser.linkedId) : fees;

  const filteredFees = relevantFees.filter(fee => {
    const matchesSearch = fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fee.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fee.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fee.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' ? true : fee.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getTrueStudentDue = (studentId) => {
    const enrollment = enrollments.find(en => en.studentId === studentId && en.status === 'Enrolled');
    if (!enrollment) return 0;
    const batch = batches.find(b => b.id === enrollment.batchId);
    if (!batch) return 0;
    const structure = feeStructures.find(fs => fs.courseId === batch.courseId);
    if (!structure) return 0;
    const totalPaid = fees.filter(f => f.studentId === studentId && f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    return Math.max(0, structure.totalAmount - totalPaid);
  };

  const totalCollected = relevantFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const pendingDues = currentUser?.role === 'Student' 
    ? getTrueStudentDue(currentUser.linkedId) 
    : fees.filter(f => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0);
  const paidStudents = currentUser?.role === 'Student' ? 1 : new Set(relevantFees.filter(f => f.status === 'Paid').map(f => f.studentId)).size;

  const getStudentName = (id) => students.find(s => s.id === id)?.name || id;

  const handleCollectSubmit = (data) => {
    if (data.studentId && data.amount && data.type) {
      addFee({ 
        studentId: data.studentId.toUpperCase(), 
        amount: Number(data.amount), 
        type: data.type, 
        status: 'Paid', 
        date: new Date().toISOString().split('T')[0] 
      });
      setShowCollectModal(false);
    }
  };

  const handleAddStructure = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const courseId = formData.get('courseId');
    const breakdown = {};
    let totalAmount = 0;
    
    breakdownItems.forEach(item => {
      if (item.type && item.amount !== '') {
        const amt = Number(item.amount);
        breakdown[item.type] = amt;
        totalAmount += amt;
      }
    });

    if (courseId && totalAmount > 0) {
      addFeeStructure({ courseId, totalAmount, breakdown });
      setShowStructuresModal(false);
      setBreakdownItems([{ type: 'Tuition', amount: '' }]);
    }
  };

  const handleAddBreakdownItem = () => setBreakdownItems([...breakdownItems, { type: '', amount: '' }]);
  const handleRemoveBreakdownItem = (index) => setBreakdownItems(breakdownItems.filter((_, i) => i !== index));
  const handleUpdateBreakdownItem = (index, field, value) => {
    const newItems = [...breakdownItems];
    newItems[index][field] = value;
    setBreakdownItems(newItems);
  };

  const handleCheckDues = (e) => {
    e.preventDefault();
    const studentId = new FormData(e.target).get('studentId').toUpperCase();
    performCheckDues(studentId);
  };

  const performCheckDues = (studentId) => {
    const enrollment = enrollments.find(en => en.studentId === studentId && en.status === 'Enrolled');
    if (!enrollment) return setDuesResult({ error: 'No active enrollment found for this student.' });

    const batch = batches.find(b => b.id === enrollment.batchId);
    if (!batch) return setDuesResult({ error: 'Batch not found.' });
    
    const course = courses.find(c => c.id === batch.courseId);
    const structure = feeStructures.find(fs => fs.courseId === batch.courseId);
    if (!structure) return setDuesResult({ error: `No fee structure defined for course: ${course?.title || batch.courseId}` });

    const totalPaid = fees.filter(f => f.studentId === studentId && f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    
    const paidByType = {};
    fees.filter(f => f.studentId === studentId && f.status === 'Paid').forEach(f => {
      paidByType[f.type] = (paidByType[f.type] || 0) + f.amount;
    });
    
    setDuesResult({
      studentName: getStudentName(studentId),
      courseName: course?.title,
      totalFee: structure.totalAmount,
      totalPaid,
      due: Math.max(0, structure.totalAmount - totalPaid),
      paidByType,
      breakdown: structure.breakdown
    });
  };

  const generateReportData = () => {
    let validBatches = batches;
    if (reportFilters.departmentId) {
      const deptCourses = courses.filter(c => c.department === reportFilters.departmentId).map(c => c.id);
      validBatches = validBatches.filter(b => deptCourses.includes(b.courseId));
    }
    if (reportFilters.courseId) {
      validBatches = validBatches.filter(b => b.courseId === reportFilters.courseId);
    }
    if (reportFilters.batchId) {
      validBatches = validBatches.filter(b => b.id === reportFilters.batchId);
    }
    
    const validBatchIds = validBatches.map(b => b.id);
    let reportStudents = enrollments.filter(e => validBatchIds.includes(e.batchId) && e.status === 'Enrolled');
    
    const data = reportStudents.map(enr => {
      const student = students.find(s => s.id === enr.studentId);
      const batch = batches.find(b => b.id === enr.batchId);
      const course = courses.find(c => c.id === batch?.courseId);
      const structure = feeStructures.find(fs => fs.courseId === batch?.courseId);
      const totalFee = structure ? structure.totalAmount : 0;
      
      const totalPaid = fees.filter(f => f.studentId === enr.studentId && f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
      const due = Math.max(0, totalFee - totalPaid);
      const status = due === 0 ? 'Fully Paid' : 'Has Dues';
      
      return {
        studentId: student?.id || enr.studentId,
        studentName: student?.name || 'Unknown',
        department: course?.department || 'N/A',
        courseName: course?.title || 'N/A',
        batchName: batch?.name || 'N/A',
        totalFee,
        totalPaid,
        due,
        status
      };
    });
    
    if (reportFilters.status !== 'All') {
      return data.filter(d => d.status === reportFilters.status);
    }
    return data;
  };

  const reportData = showReportsModal ? generateReportData() : [];

  const handleExportCSV = () => {
    if (reportData.length === 0) return alert("No data to export.");
    
    const headers = ["Student ID", "Student Name", "Department", "Course", "Batch", "Total Fee", "Total Paid", "Due", "Status"];
    const csvRows = [headers.join(",")];
    
    reportData.forEach(row => {
      csvRows.push([
        row.studentId, 
        `"${row.studentName}"`, 
        `"${row.department}"`, 
        `"${row.courseName}"`, 
        `"${row.batchName}"`, 
        row.totalFee, 
        row.totalPaid, 
        row.due, 
        row.status
      ].join(","));
    });
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Fee_Report_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Fees Management</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {currentUser?.role === 'Student' ? 'View your fee receipts, track pending dues, and make payments.' : 'Automate fee transactions, real-time tracking, and online payments.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentUser?.role !== 'Student' && (
            <>
              {currentUser?.role === 'Admin' && (
                <button onClick={() => setShowStructuresModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                  <Settings size={18} /> Manage Structures
                </button>
              )}
              {currentUser?.role !== 'Management' && (
                <>
                  <button onClick={() => setShowDuesModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                    <Calculator size={18} /> Check Dues
                  </button>
                  <button onClick={() => setShowCollectModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                    <Plus size={18} /> Collect Fees
                  </button>
                </>
              )}
              <button onClick={() => setShowReportsModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                <FileText size={18} /> Reports
              </button>
            </>
          )}
          {currentUser?.role === 'Student' && (
            <button onClick={() => { setShowDuesModal(true); performCheckDues(currentUser.linkedId); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <Calculator size={18} /> View My Dues
            </button>
          )}
        </div>
      </div>

      <div className="responsive-grid-3">
        <Card onClick={() => setFilterStatus(currentUser?.role === 'Student' ? 'Paid' : 'All')} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: (filterStatus === 'All' && currentUser?.role !== 'Student') || (filterStatus === 'Paid' && currentUser?.role === 'Student') ? '2px solid #1976d2' : '1px solid var(--border-light)', transition: 'border 0.2s' }}>
          <div style={{ color: '#1976d2' }}><CreditCard size={24} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {currentUser?.role === 'Student' ? 'Total Paid' : 'Total Collected (Term)'}
            </p>
            <h2 style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>₹{totalCollected.toLocaleString()}</h2>
          </div>
        </Card>
        <Card onClick={() => currentUser?.role === 'Student' ? (setShowDuesModal(true), performCheckDues(currentUser.linkedId)) : setFilterStatus('Pending')} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: filterStatus === 'Pending' && currentUser?.role !== 'Student' ? '2px solid #f57c00' : '1px solid var(--border-light)', transition: 'border 0.2s' }}>
          <div style={{ color: '#f57c00' }}><Clock size={24} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Pending Dues</p>
            <h2 style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>₹{pendingDues.toLocaleString()}</h2>
          </div>
        </Card>
        {currentUser?.role === 'Student' ? (
          <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-light)' }}>
            <div style={{ color: pendingDues === 0 ? '#388e3c' : '#d32f2f' }}><CheckCircle size={24} /></div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Payment Status</p>
              <h2 style={{ margin: '0.25rem 0 0 0', color: pendingDues === 0 ? '#388e3c' : '#d32f2f' }}>
                {pendingDues === 0 ? 'Clear' : 'Action Required'}
              </h2>
            </div>
          </Card>
        ) : (
          <Card onClick={() => setFilterStatus('Paid')} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: filterStatus === 'Paid' ? '2px solid #388e3c' : '1px solid var(--border-light)', transition: 'border 0.2s' }}>
            <div style={{ color: '#388e3c' }}><CheckCircle size={24} /></div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Paid Students</p>
              <h2 style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>{paidStudents}</h2>
            </div>
          </Card>
        )}
      </div>

      <Card style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            {currentUser?.role === 'Student' ? 'My Transactions' : 'Recent Transactions'}
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search receipt or student..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem 0.5rem 0.5rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', width: '250px' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 0.75rem' }}>Receipt ID</th>
                <th style={{ padding: '1rem 0.75rem' }}>Student Name</th>
                <th style={{ padding: '1rem 0.75rem' }}>Fee Type</th>
                <th style={{ padding: '1rem 0.75rem' }}>Amount</th>
                <th style={{ padding: '1rem 0.75rem' }}>Date</th>
                <th style={{ padding: '1rem 0.75rem' }}>Status</th>
                {currentUser?.role === 'Admin' && <th style={{ padding: '1rem 0.75rem' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredFees.map(fee => (
                <tr key={fee.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{fee.id}</td>
                  <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{getStudentName(fee.studentId)}</td>
                  <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{fee.type}</td>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>₹{fee.amount}</td>
                  <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{fee.date}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: fee.status === 'Paid' ? '#e8f5e9' : '#fff3e0',
                      color: fee.status === 'Paid' ? '#2e7d32' : '#e65100'
                    }}>
                      {fee.status}
                    </span>
                  </td>
                  {currentUser?.role === 'Admin' && (
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <button 
                        onClick={() => {
                          if (window.confirm('Send this fee entry to Recovery Centre?')) {
                            deleteFee(fee.id);
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        title="Move to Recovery Centre"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showStructuresModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '1rem', width: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Manage Fee Structures</h2>
              <button onClick={() => setShowStructuresModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddStructure} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Course</label>
                <select name="courseId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Fee Breakdown</label>
                {breakdownItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Fee Type (e.g. Tuition)" 
                      value={item.type}
                      onChange={(e) => handleUpdateBreakdownItem(index, 'type', e.target.value)}
                      required
                      style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} 
                    />
                    <input 
                      type="number" 
                      placeholder="Amount (₹)" 
                      value={item.amount}
                      onChange={(e) => handleUpdateBreakdownItem(index, 'amount', e.target.value)}
                      required
                      min="0"
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} 
                    />
                    <button type="button" onClick={() => handleRemoveBreakdownItem(index)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', padding: '0.5rem' }}>
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddBreakdownItem} style={{ background: 'none', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '0.5rem', width: '100%', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500, marginTop: '0.5rem' }}>
                  + Add Fee Component
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Total Course Fee:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.125rem' }}>
                  ₹{breakdownItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString()}
                </span>
              </div>

              <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
                Save Structure
              </button>
            </form>
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Existing Structures</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {feeStructures.map(fs => (
                  <div key={fs.id} style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', background: 'var(--bg-base)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{courses.find(c => c.id === fs.courseId)?.title || fs.courseId}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{fs.totalAmount.toLocaleString()}</span>
                    </div>
                    {/* Tabular View for individual fee structure items */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <tbody>
                        {Object.entries(fs.breakdown).map(([type, amount]) => (
                          <tr key={type} style={{ borderTop: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.25rem 0', color: 'var(--text-secondary)' }}>{type}</td>
                            <td style={{ padding: '0.25rem 0', textAlign: 'right', color: 'var(--text-primary)' }}>₹{amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDuesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '1rem', width: '500px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{currentUser?.role === 'Student' ? 'My Dues' : 'Check Student Dues'}</h2>
              <button onClick={() => {setShowDuesModal(false); setDuesResult(null);}} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>
            {currentUser?.role !== 'Student' && (
              <form onSubmit={handleCheckDues} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input type="text" name="studentId" required placeholder="Student ID (e.g. STU001)" style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>Lookup</button>
              </form>
            )}

            {duesResult && (
              <div style={{ padding: '1.5rem', background: 'var(--bg-base)', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}>
                {duesResult.error ? (
                  <p style={{ color: '#d32f2f', margin: 0 }}>{duesResult.error}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{duesResult.studentName}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Course: {duesResult.courseName}</p>
                    </div>
                    
                    {/* Embedded Tabular Fee Breakdown */}
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Fee Breakdown</h4>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>Component</th>
                            <th style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 500 }}>Total</th>
                            <th style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 500 }}>Paid</th>
                            <th style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 500 }}>Due</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(duesResult.breakdown || {}).map(([type, amount]) => {
                            const paid = duesResult.paidByType[type] || 0;
                            const due = Math.max(0, amount - paid);
                            return (
                              <tr key={type} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.5rem 0', color: 'var(--text-primary)' }}>{type}</td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 500, color: 'var(--text-primary)' }}>₹{amount.toLocaleString()}</td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 500, color: '#388e3c' }}>₹{paid.toLocaleString()}</td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 600, color: due > 0 ? '#d32f2f' : 'var(--text-secondary)' }}>₹{due.toLocaleString()}</td>
                              </tr>
                            );
                          })}
                          <tr style={{ background: 'var(--surface-hover)' }}>
                            <td style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Total Course Fee</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>₹{duesResult.totalFee.toLocaleString()}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600, color: '#388e3c' }}>₹{duesResult.totalPaid.toLocaleString()}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: '#d32f2f' }}>₹{duesResult.due.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                      <span style={{ color: '#388e3c', fontWeight: 500 }}>Amount Paid:</span>
                      <span style={{ fontWeight: 600, color: '#388e3c' }}>₹{duesResult.totalPaid.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                      <span style={{ color: '#d32f2f', fontWeight: 600 }}>Outstanding Due:</span>
                      <span style={{ fontWeight: 700, color: '#d32f2f', fontSize: '1.25rem' }}>₹{duesResult.due.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showReportsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '1rem', width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Fee Reports</h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Filter and generate customized fee data.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                  <Download size={16} /> Export CSV
                </button>
                <button onClick={() => setShowReportsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Department</label>
                <select value={reportFilters.departmentId} onChange={(e) => setReportFilters({...reportFilters, departmentId: e.target.value, courseId: '', batchId: ''})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                  <option value="">All Departments</option>
                  {departments?.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Course</label>
                <select value={reportFilters.courseId} onChange={(e) => setReportFilters({...reportFilters, courseId: e.target.value, batchId: ''})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                  <option value="">All Courses</option>
                  {courses.filter(c => reportFilters.departmentId ? c.department === reportFilters.departmentId : true).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Batch</label>
                <select value={reportFilters.batchId} onChange={(e) => setReportFilters({...reportFilters, batchId: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                  <option value="">All Batches</option>
                  {batches.filter(b => reportFilters.courseId ? b.courseId === reportFilters.courseId : true).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status</label>
                <select value={reportFilters.status} onChange={(e) => setReportFilters({...reportFilters, status: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                  <option value="All">All Statuses</option>
                  <option value="Fully Paid">Fully Paid</option>
                  <option value="Has Dues">Has Dues</option>
                </select>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1 }}>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem' }}>Student ID</th>
                    <th style={{ padding: '0.75rem' }}>Name</th>
                    <th style={{ padding: '0.75rem' }}>Course/Batch</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Fee</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Paid</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Due</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{row.studentId}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{row.studentName}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ color: 'var(--text-primary)' }}>{row.courseName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.batchName}</div>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>₹{row.totalFee.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#388e3c' }}>₹{row.totalPaid.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: row.due > 0 ? '#d32f2f' : 'var(--text-secondary)' }}>₹{row.due.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: row.due === 0 ? '#e8f5e9' : '#fff3e0', color: row.due === 0 ? '#2e7d32' : '#e65100' }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {reportData.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No data matches the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {reportData.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Showing {reportData.length} records</span>
                <div style={{ display: 'flex', gap: '1.5rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-primary)' }}>Total Fee: ₹{reportData.reduce((s, r) => s + r.totalFee, 0).toLocaleString()}</span>
                  <span style={{ color: '#388e3c' }}>Total Paid: ₹{reportData.reduce((s, r) => s + r.totalPaid, 0).toLocaleString()}</span>
                  <span style={{ color: '#d32f2f' }}>Total Due: ₹{reportData.reduce((s, r) => s + r.due, 0).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <AddEntryModal 
        isOpen={showCollectModal}
        onClose={() => setShowCollectModal(false)}
        onSave={handleCollectSubmit}
        title="Collect Fee Payment"
        fields={[
          { name: 'studentId', label: 'Student ID', required: true, placeholder: 'e.g. STU001' },
          { name: 'amount', label: 'Amount (₹)', type: 'number', required: true, placeholder: 'e.g. 5000' },
          { name: 'type', label: 'Fee Type', required: true, placeholder: 'e.g. Tuition' }
        ]}
      />
    </div>
  );
};

export default Fees;
