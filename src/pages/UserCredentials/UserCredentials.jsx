import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../../components/Card/Card';
import { Eye, EyeOff, Plus, Search, KeyRound, ShieldCheck, Copy, Check, Filter } from 'lucide-react';

const ROLE_COLORS = {
  Admin: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
  Management: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  Faculty: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  'Office Staff': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  Student: { bg: 'rgba(156,163,175,0.12)', color: '#9ca3af' },
};

const UserCredentials = () => {
  const { users, setUsers, currentUser, SUPER_ADMIN_EMAIL } = useContext(AppContext);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [copied, setCopied] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Faculty' });

  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL || currentUser?.isSuperAdmin;
  const isAuthorized = ['Admin', 'Management'].includes(currentUser?.role) || isSuperAdmin;

  const roles = ['All', 'Admin', 'Management', 'Faculty', 'Office Staff', 'Student'];

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleReveal = (id) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    const id = `USR${Date.now().toString().slice(-5)}`;
    const user = { id, ...newUser, lastPasswordChange: null };
    setUsers(prev => [...prev, user]);
    showToast(`User ${newUser.name} created successfully!`);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', password: '', role: 'Faculty' });
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
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage login IDs and initial passwords assigned to all system users.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79,70,229,0.4)' }}
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      {/* Info Banner */}
      <div style={{ padding: '0.875rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.875rem', color: '#d97706' }}>
        <KeyRound size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <strong>Sensitive Data — Authorized Access Only.</strong> Passwords shown here are the <em>initial</em> system-assigned credentials. Users should be prompted to change them on first login. Do not share this screen. Access is logged.
        </div>
      </div>

      {/* Filters */}
      <Card style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search by name, email or ID…"
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
          <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
            {filtered.length} of {users.length} users
          </span>
        </div>
      </Card>

      {/* Table */}
      <Card style={{ padding: 0 }}>
        <div className="table-responsive" style={{ margin: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                <th style={{ padding: '0.875rem 1rem' }}>#</th>
                <th style={{ padding: '0.875rem 1rem' }}>User ID</th>
                <th style={{ padding: '0.875rem 1rem' }}>Name</th>
                <th style={{ padding: '0.875rem 1rem' }}>Email</th>
                <th style={{ padding: '0.875rem 1rem' }}>Role</th>
                <th style={{ padding: '0.875rem 1rem' }}>Initial Password</th>
                <th style={{ padding: '0.875rem 1rem' }}>Last Changed</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const revealed = revealedIds.has(u.id);
                const rc = ROLE_COLORS[u.role] || ROLE_COLORS.Student;
                const lastChange = u.lastPasswordChange ? new Date(u.lastPasswordChange).toLocaleDateString() : null;
                return (
                  <tr key={u.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>{idx + 1}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code style={{ background: 'var(--bg-base)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, border: '1px solid var(--border-light)' }}>{u.id}</code>
                        {u.isSuperAdmin && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '2rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white' }}>
                            <ShieldCheck size={8} /> SUPER
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.65rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, background: rc.bg, color: rc.color }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: revealed ? 'var(--text-primary)' : 'transparent', textShadow: revealed ? 'none' : '0 0 8px var(--text-primary)', userSelect: revealed ? 'text' : 'none', transition: 'all 0.3s' }}>
                          {u.password}
                        </code>
                        {revealed && (
                          <button onClick={() => copyToClipboard(u.password, u.id + '_pw')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === u.id + '_pw' ? '#10b981' : 'var(--text-tertiary)', padding: '2px' }}>
                            {copied === u.id + '_pw' ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8125rem', color: lastChange ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                      {lastChange ? lastChange : <span style={{ fontStyle: 'italic' }}>Never changed</span>}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleReveal(u.id)}
                        title={revealed ? 'Hide password' : 'Reveal password'}
                        style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', background: revealed ? 'rgba(239,68,68,0.1)' : 'var(--bg-base)', border: '1px solid var(--border-light)', color: revealed ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', transition: 'all 0.2s' }}
                      >
                        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        {revealed ? 'Hide' : 'Reveal'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No users match the current filter.</td></tr>
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
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Initial Password *</label>
                  <input type="text" required value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="e.g. Pass@2026" style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                </div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(99,102,241,0.08)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                💡 <strong>Tip:</strong> Share these credentials securely with the user. They can change their password from Settings after logging in.
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Create Account</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#1e293b', color: 'white', padding: '1rem 1.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', zIndex: 3000, fontSize: '0.9rem', fontWeight: 500 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
};

export default UserCredentials;
