import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import { Eye, EyeOff, Plus, Search, KeyRound, ShieldCheck, Copy, Check, Filter, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';

const ROLE_COLORS = {
  Admin: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
  Management: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  Faculty: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  'Office Staff': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  Student: { bg: 'rgba(156,163,175,0.12)', color: '#9ca3af' },
};

const UserCredentials = () => {
  const { users, setUsers, currentUser } = useContext(AppContext);
  const { signup } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [copied, setCopied] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Faculty' });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthorized = ['Admin', 'Management'].includes(currentUser?.role);
  const roles = ['All', 'Admin', 'Management', 'Faculty', 'Office Staff', 'Student'];

  const filtered = users.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.id || u._id || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    
    setIsLoading(true);
    const result = await signup(newUser);
    
    if (result.status === 'ok') {
      showToast(`User ${newUser.name} created successfully!`);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'Faculty' });
      // Refresh user list
      const updatedUsers = await api.get('users');
      if (updatedUsers) setUsers(updatedUsers);
    } else {
      alert(result.message || 'Failed to create user');
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Pending' || currentStatus === 'Blocked' ? 'Active' : 'Blocked';
    try {
      await api.put('users', userId, { status: newStatus });
      setUsers(prev => prev.map(u => (u._id === userId || u.id === userId) ? { ...u, status: newStatus } : u));
      showToast(`User marked as ${newStatus}`);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will revoke their access immediately.')) return;
    
    try {
      await api.delete('users', userId);
      setUsers(prev => prev.filter(u => u._id !== userId && u.id !== userId));
      showToast('User deleted successfully');
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <ShieldCheck size={64} color="var(--border-color)" />
        <h2 style={{ color: 'var(--text-secondary)' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-tertiary)' }}>Only Administrators and Management can view this page.</p>
      </div>
    );
  }

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>User Credentials</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage login accounts, approvals, and roles.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79,70,229,0.4)' }}
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      {/* Info Banner */}
      <div style={{ padding: '0.875rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--primary)' }}>
        <KeyRound size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <strong>User Approval System Active.</strong> New signups are set to "Pending" and cannot log in until approved. Use the "Approve" button in the table below to grant access.
        </div>
      </div>

      {/* Filters */}
      <Card style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Filter size={16} color="var(--text-tertiary)" />
            {roles.map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                style={{ padding: '0.4rem 0.875rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: roleFilter === r ? 'var(--primary)' : 'var(--bg-base)', color: roleFilter === r ? 'white' : 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', fontSize: '0.8125rem', transition: 'all 0.2s' }}
              >{r}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card style={{ padding: 0 }}>
        <div className="table-responsive" style={{ margin: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                <th style={{ padding: '0.875rem 1rem' }}>User</th>
                <th style={{ padding: '0.875rem 1rem' }}>Email</th>
                <th style={{ padding: '0.875rem 1rem' }}>Role</th>
                <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const rc = ROLE_COLORS[u.role] || ROLE_COLORS.Student;
                const statusColor = u.status === 'Active' ? '#10b981' : u.status === 'Pending' ? '#f59e0b' : '#ef4444';
                return (
                  <tr key={u._id || u.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {u.id || u._id}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.email}</span>
                        <button onClick={() => copyToClipboard(u.email, u.id + '_email')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === u.id + '_email' ? '#10b981' : 'var(--text-tertiary)', padding: '2px' }}>
                          {copied === u.id + '_email' ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.65rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, background: rc.bg, color: rc.color }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.375rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        background: `${statusColor}15`, 
                        color: statusColor,
                        border: `1px solid ${statusColor}30`
                      }}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {u.status !== 'Active' ? (
                          <button
                            onClick={() => handleToggleStatus(u._id || u.id, u.status)}
                            style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(u._id || u.id, u.status)}
                            disabled={u.email === currentUser?.email}
                            style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef444430', cursor: u.email === currentUser?.email ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 600, opacity: u.email === currentUser?.email ? 0.5 : 1 }}
                          >
                            Block
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u._id || u.id)}
                          disabled={u.email === currentUser?.email}
                          style={{ padding: '0.4rem', borderRadius: '0.375rem', background: 'var(--bg-base)', border: '1px solid var(--border-light)', color: '#ef4444', cursor: u.email === currentUser?.email ? 'not-allowed' : 'pointer', opacity: u.email === currentUser?.email ? 0.5 : 1 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <Card style={{ width: '500px', maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Create New User Account</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleAddUser} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Full Name *</label>
                <input type="text" required value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Dr. Priya Sharma" style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Email Address *</label>
                <input type="email" required value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="user@kashibaiganpatcollege.com" style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Role *</label>
                  <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    <option>Admin</option>
                    <option>Management</option>
                    <option>Faculty</option>
                    <option>Office Staff</option>
                    <option>Student</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Password *</label>
                  <input type="password" required value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isLoading} style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#10b981', color: 'white', padding: '1rem 1.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', zIndex: 3000, fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={18} /> {toast}
        </div>
      )}
    </div>
  );
};

export default UserCredentials;
