import React, { useState } from 'react';
import { User, Palette, Save, Shield, Eye, EyeOff } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import Card from '../../components/Card/Card';
import ModuleGuide from '../../components/ModuleGuide';
import styles from './Settings.module.css';

const Settings = () => {
  const { currentUser, changePassword, SUPER_ADMIN_EMAIL, PASSWORD_CHANGE_DAYS } = React.useContext(AppContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('light');
  const [pwdMsg, setPwdMsg] = useState(null); // { ok, text }
  
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPass, setShowPass] = useState(false);

  const handlePasswordChange = () => {
    if (!passwordForm.current || !passwordForm.new) {
      setPwdMsg({ ok: false, text: 'Please fill in all fields.' });
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPwdMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.new.length < 8) {
      setPwdMsg({ ok: false, text: 'New password must be at least 8 characters.' });
      return;
    }
    const result = changePassword(passwordForm.current, passwordForm.new);
    setPwdMsg({ ok: result.ok, text: result.message });
    if (result.ok) setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL || currentUser?.isSuperAdmin;
  const lastChange = currentUser?.lastPasswordChange;
  const daysSinceChange = lastChange ? Math.floor((Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24)) : null;
  const canChangeNow = isSuperAdmin || daysSinceChange === null || daysSinceChange >= PASSWORD_CHANGE_DAYS;
  const nextAllowed = lastChange ? new Date(new Date(lastChange).getTime() + PASSWORD_CHANGE_DAYS * 24 * 60 * 60 * 1000).toDateString() : null;

  return (
    <div className={`${styles.settingsPage} page-animate`}>
      <ModuleGuide 
        role={currentUser?.role}
        adminText="Manage your personal account settings, security preferences, and UI theme."
      />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your account preferences and system settings.</p>
        </div>
        <button className={styles.primaryBtn}>
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className={styles.content}>
        <Card className={styles.sidebar}>
          <nav className={styles.nav}>
            <button 
              className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>Profile</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'appearance' ? styles.active : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette size={18} />
              <span>Appearance</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={18} />
              <span>Security</span>
            </button>
          </nav>
        </Card>

        <div className={styles.mainArea}>
          {activeTab === 'profile' && (
            <Card className={styles.settingsCard}>
              <h2 className={styles.cardTitle}>Profile Information</h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input type="text" className={styles.input} defaultValue={currentUser?.name} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input type="email" className={styles.input} value={currentUser?.email} disabled />
                <p className={styles.note} style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.6 }}>Login email cannot be changed from settings.</p>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Role</label>
                <input type="text" className={styles.input} value={currentUser?.role} disabled />
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className={styles.settingsCard}>
              <h2 className={styles.cardTitle}>Change Password</h2>
              {/* Password Policy Info */}
              {!isSuperAdmin && (
                <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>🔒 Password Policy</strong>
                  Password can only be changed once every <strong>{PASSWORD_CHANGE_DAYS} days</strong>.
                  {!canChangeNow && nextAllowed && (
                    <div style={{ marginTop: '0.25rem', color: '#f59e0b' }}>Next change allowed on: <strong>{nextAllowed}</strong></div>
                  )}
                  {lastChange && canChangeNow && <div style={{ marginTop: '0.25rem', color: '#10b981' }}>✓ You are eligible to change your password.</div>}
                </div>
              )}
              {isSuperAdmin && (
                <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1rem', fontSize: '0.8125rem', color: '#10b981' }}>
                  <strong>⚡ Super Admin Override</strong> — You can change the password at any time.
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.label}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPass ? "text" : "password"} 
                    className={styles.input} 
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                    disabled={!canChangeNow}
                  />
                  <button 
                    onClick={() => setShowPass(!showPass)} 
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <input 
                  type="password" 
                  className={styles.input} 
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  disabled={!canChangeNow}
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm New Password</label>
                <input 
                  type="password" 
                  className={styles.input} 
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  disabled={!canChangeNow}
                />
              </div>
              {pwdMsg && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: pwdMsg.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: pwdMsg.ok ? '#10b981' : '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {pwdMsg.text}
                </div>
              )}
              <button 
                className={styles.primaryBtn} 
                onClick={handlePasswordChange} 
                style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', opacity: canChangeNow ? 1 : 0.5, cursor: canChangeNow ? 'pointer' : 'not-allowed' }}
                disabled={!canChangeNow}
              >
                Update Password
              </button>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className={styles.settingsCard}>
              <h2 className={styles.cardTitle}>Theme Settings</h2>
              <div className={styles.themeOptions}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="theme" 
                    value="light" 
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                  />
                  <span>Light Mode</span>
                </label>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="theme" 
                    value="dark" 
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                  />
                  <span>Dark Mode</span>
                </label>
              </div>
              <p className={styles.note}>Note: Dark mode implementation requires updating CSS variables across the app.</p>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
