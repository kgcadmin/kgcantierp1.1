import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../../components/Card/Card';
import { Download, Upload, HardDrive, Archive, CheckCircle, AlertCircle, Trash2, Database, Clock, Filter } from 'lucide-react';

const ALL_KEYS = [
  { key: 'edusec_students', label: 'Students', icon: '🎓' },
  { key: 'edusec_faculty', label: 'Faculty', icon: '👨‍🏫' },
  { key: 'edusec_staff', label: 'Staff', icon: '🧑‍💼' },
  { key: 'edusec_courses', label: 'Courses', icon: '📚' },
  { key: 'edusec_batches', label: 'Batches', icon: '🗂️' },
  { key: 'edusec_enrollments', label: 'Enrollments', icon: '📋' },
  { key: 'edusec_attendance', label: 'Student Attendance', icon: '✅' },
  { key: 'edusec_staffAttendance', label: 'Staff Attendance', icon: '🕐' },
  { key: 'edusec_fees', label: 'Fees', icon: '💰' },
  { key: 'edusec_feeStructures', label: 'Fee Structures', icon: '💳' },
  { key: 'edusec_payroll', label: 'Payroll', icon: '💵' },
  { key: 'edusec_leaves', label: 'Leaves', icon: '🌿' },
  { key: 'edusec_finance', label: 'Finance', icon: '📊' },
  { key: 'edusec_exams', label: 'Exams', icon: '📝' },
  { key: 'edusec_timetable', label: 'Timetable', icon: '🗓️' },
  { key: 'edusec_library', label: 'Library', icon: '📖' },
  { key: 'edusec_hostel', label: 'Hostel', icon: '🏠' },
  { key: 'edusec_documents', label: 'Documents', icon: '📄' },
  { key: 'edusec_communication', label: 'Communication', icon: '💬' },
  { key: 'edusec_calendar', label: 'Academic Calendar', icon: '📅' },
  { key: 'edusec_departments', label: 'Departments', icon: '🏛️' },
  { key: 'edusec_subjects', label: 'Subjects', icon: '🔬' },
  { key: 'edusec_config', label: 'System Config', icon: '⚙️' },
  { key: 'edusec_users', label: 'User Accounts', icon: '👤' },
];

const getSizeKB = (key) => {
  const val = localStorage.getItem(key);
  if (!val) return 0;
  return (new Blob([val]).size / 1024).toFixed(1);
};

const getTotalKB = () => {
  let total = 0;
  ALL_KEYS.forEach(({ key }) => { const v = localStorage.getItem(key); if (v) total += new Blob([v]).size; });
  return (total / 1024).toFixed(1);
};

const DataArchive = () => {
  const { currentUser, SUPER_ADMIN_EMAIL } = useContext(AppContext);
  const [selectedKeys, setSelectedKeys] = useState(new Set(ALL_KEYS.map(k => k.key)));
  const [yearFilter, setYearFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [backupLog, setBackupLog] = useState(() => {
    const saved = localStorage.getItem('edusec_backup_log');
    return saved ? JSON.parse(saved) : [];
  });
  const fileRef = useRef();

  const isAuthorized = ['Admin', 'Management'].includes(currentUser?.role) || currentUser?.email === SUPER_ADMIN_EMAIL;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleKey = (key) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filterByYear = (data, year) => {
    if (!year || !Array.isArray(data)) return data;
    return data.filter(item => {
      const dateFields = [item.date, item.startDate, item.dateAdded, item.month, item.hireDate, item.createdAt];
      return dateFields.some(f => f && String(f).includes(year));
    });
  };

  const handleExport = () => {
    const snapshot = { exportedAt: new Date().toISOString(), yearFilter: yearFilter || 'All', exportedBy: currentUser?.name, appVersion: 'KGC ERP v1.1', data: {} };
    selectedKeys.forEach(key => {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const label = ALL_KEYS.find(k => k.key === key)?.label || key;
      try {
        let parsed = JSON.parse(raw);
        if (yearFilter) parsed = filterByYear(parsed, yearFilter);
        snapshot.data[label] = parsed;
      } catch { snapshot.data[label] = raw; }
    });

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const datePart = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `KGC_ERP_Backup_${yearFilter || 'Full'}_${datePart}.json`;
    a.click();
    URL.revokeObjectURL(url);

    const logEntry = { id: Date.now(), date: new Date().toISOString(), year: yearFilter || 'All', modules: selectedKeys.size, by: currentUser?.name, size: `${(new Blob([JSON.stringify(snapshot)]).size / 1024).toFixed(1)} KB` };
    const newLog = [logEntry, ...backupLog].slice(0, 20);
    setBackupLog(newLog);
    localStorage.setItem('edusec_backup_log', JSON.stringify(newLog));
    showToast(`Backup downloaded: KGC_ERP_Backup_${yearFilter || 'Full'}_${datePart}.json`);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportStatus({ status: 'reading', file: file.name });

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const snapshot = JSON.parse(ev.target.result);
        if (!snapshot.data) throw new Error('Invalid backup file format.');

        let restored = 0;
        Object.entries(snapshot.data).forEach(([label, value]) => {
          const entry = ALL_KEYS.find(k => k.label === label);
          if (entry) { localStorage.setItem(entry.key, JSON.stringify(value)); restored++; }
        });

        setImportStatus({ status: 'success', file: file.name, restored, exportedAt: snapshot.exportedAt, year: snapshot.yearFilter });
        showToast(`✓ Restored ${restored} modules from backup. Refresh the page to apply.`);
      } catch (err) {
        setImportStatus({ status: 'error', file: file.name, error: err.message });
        showToast(`Import failed: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearLog = () => { setBackupLog([]); localStorage.removeItem('edusec_backup_log'); };

  if (!isAuthorized) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <Archive size={64} color="var(--border-color)" />
      <h2 style={{ color: 'var(--text-secondary)' }}>Access Denied</h2>
      <p style={{ color: 'var(--text-tertiary)' }}>Only Admin and Management can access the Data Archive.</p>
    </div>
  );

  const totalKB = getTotalKB();

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>Data Archive & Backup</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Export system data to your drive for safe keeping. Import it back anytime to restore.</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Data Size', value: `${totalKB} KB`, icon: <Database size={22} color="#6366f1" />, bg: 'rgba(99,102,241,0.1)' },
          { label: 'Modules Tracked', value: ALL_KEYS.length, icon: <Archive size={22} color="#10b981" />, bg: 'rgba(16,185,129,0.1)' },
          { label: 'Backups Made', value: backupLog.length, icon: <HardDrive size={22} color="#f59e0b" />, bg: 'rgba(245,158,11,0.1)' },
          { label: 'Last Backup', value: backupLog[0] ? new Date(backupLog[0].date).toLocaleDateString() : 'Never', icon: <Clock size={22} color="#3b82f6" />, bg: 'rgba(59,130,246,0.1)' },
        ].map((s, i) => (
          <Card key={i} style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: s.bg, flexShrink: 0 }}>{s.icon}</div>
            <div><p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p><p style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{s.value}</p></div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* EXPORT */}
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ padding: '0.625rem', background: 'rgba(99,102,241,0.12)', borderRadius: '0.5rem' }}><Download size={20} color="#6366f1" /></div>
            <div><h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Export / Download Backup</h2><p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Save data to your hard drive or pen drive</p></div>
          </div>

          {/* Year filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><Filter size={13} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />Filter by Academic Year (optional)</label>
            <input type="text" placeholder="e.g. 2026 or 2025-26 — leave blank for ALL data" value={yearFilter} onChange={e => setYearFilter(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Filters date-based records (attendance, fees, exams, payroll etc.) by year string match.</p>
          </div>

          {/* Module selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Modules to Include</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setSelectedKeys(new Set(ALL_KEYS.map(k => k.key)))} style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>All</button>
                <button onClick={() => setSelectedKeys(new Set())} style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>None</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {ALL_KEYS.map(({ key, label, icon }) => {
                const sizeKB = getSizeKB(key);
                const checked = selectedKeys.has(key);
                return (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.625rem', borderRadius: '0.5rem', border: `1px solid ${checked ? 'var(--primary)' : 'var(--border-color)'}`, background: checked ? 'rgba(99,102,241,0.06)' : 'var(--bg-base)', cursor: 'pointer', fontSize: '0.8125rem', transition: 'all 0.15s' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleKey(key)} style={{ accentColor: 'var(--primary)', flexShrink: 0 }} />
                    <span>{icon}</span>
                    <span style={{ flex: 1, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{sizeKB}KB</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button onClick={handleExport} disabled={selectedKeys.size === 0}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', borderRadius: '0.6rem', background: selectedKeys.size === 0 ? 'var(--border-color)' : 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: selectedKeys.size === 0 ? 'not-allowed' : 'pointer', fontSize: '0.9375rem', boxShadow: selectedKeys.size === 0 ? 'none' : '0 4px 12px rgba(99,102,241,0.35)', transition: 'all 0.2s' }}>
            <Download size={18} /> Download Backup ({selectedKeys.size} modules{yearFilter ? `, Year: ${yearFilter}` : ', All Years'})
          </button>
        </Card>

        {/* IMPORT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ padding: '0.625rem', background: 'rgba(16,185,129,0.12)', borderRadius: '0.5rem' }}><Upload size={20} color="#10b981" /></div>
              <div><h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Import / Restore Backup</h2><p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Upload a .json backup file to restore data</p></div>
            </div>

            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => fileRef.current?.click()}>
              <Upload size={32} color="var(--text-tertiary)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Click to select backup file</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Accepts: KGC_ERP_Backup_*.json</p>
              <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </div>

            {importStatus && (
              <div style={{ padding: '1rem', borderRadius: '0.625rem', background: importStatus.status === 'success' ? 'rgba(16,185,129,0.1)' : importStatus.status === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)', border: `1px solid ${importStatus.status === 'success' ? 'rgba(16,185,129,0.3)' : importStatus.status === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}` }}>
                {importStatus.status === 'success' && (<><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}><CheckCircle size={16} /> Restore Successful</div><p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>File: <strong>{importStatus.file}</strong></p><p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Modules restored: <strong>{importStatus.restored}</strong></p>{importStatus.exportedAt && <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Backup from: <strong>{new Date(importStatus.exportedAt).toLocaleString()}</strong></p>}<p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>⚠ Please refresh the page (F5) for changes to take effect.</p></>)}
                {importStatus.status === 'error' && (<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}><AlertCircle size={16} /> <strong>Error:</strong> {importStatus.error}</div>)}
                {importStatus.status === 'reading' && <p style={{ margin: 0, color: 'var(--primary)' }}>Reading {importStatus.file}…</p>}
              </div>
            )}

            <div style={{ padding: '0.875rem', borderRadius: '0.625rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.8125rem', color: '#d97706' }}>
              <strong>⚠ Important:</strong> Importing will <em>overwrite</em> existing data for the restored modules. Always export a current backup before importing an old one.
            </div>
          </Card>

          {/* VPS Backup Instructions */}
          <Card style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HardDrive size={16} color="#6366f1" /> VPS Server Backup Commands</h3>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Run on your VPS via SSH to create server-side backups:</p>
            {[
              { label: 'Full backup to file', cmd: 'cd /var/www/edusec && tar -czf ~/backup_$(date +%Y%m%d).tar.gz dist/ && echo "Done"' },
              { label: 'Restore from backup', cmd: 'cd /var/www/edusec && tar -xzf ~/backup_YYYYMMDD.tar.gz' },
              { label: 'Auto-backup (cron daily)', cmd: '0 2 * * * tar -czf ~/backups/edusec_$(date +\\%Y\\%m\\%d).tar.gz /var/www/edusec/dist/' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{item.label}</p>
                <code style={{ display: 'block', background: 'var(--bg-base)', border: '1px solid var(--border-color)', padding: '0.6rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.75rem', color: '#10b981', overflowX: 'auto', whiteSpace: 'nowrap' }}>{item.cmd}</code>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Backup Log */}
      {backupLog.length > 0 && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Backup History (this browser)</h3>
            <button onClick={clearLog} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.35rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8125rem' }}><Trash2 size={13} /> Clear Log</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                {['Date & Time', 'Academic Year', 'Modules', 'File Size', 'Exported By'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {backupLog.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>{new Date(log.date).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.75rem', fontWeight: 600 }}>{log.year}</span></td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{log.modules} modules</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{log.size}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{log.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.type === 'error' ? '#7f1d1d' : '#1e293b', color: 'white', padding: '1rem 1.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', zIndex: 3000, fontSize: '0.875rem', fontWeight: 500, maxWidth: '400px' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default DataArchive;
