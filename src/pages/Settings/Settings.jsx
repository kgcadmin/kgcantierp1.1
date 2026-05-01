import React, { useState } from 'react';
import { User, Palette, Save, Shield, Eye, EyeOff } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import Card from '../../components/Card/Card';
import ModuleGuide from '../../components/ModuleGuide';
import styles from './Settings.module.css';

const Settings = () => {
  const { currentUser, users, setUsers } = React.useContext(AppContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('light');
  
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPass, setShowPass] = useState(false);

  const handlePasswordChange = () => {
    if (!passwordForm.current || !passwordForm.new) {
      alert("Please fill in all fields.");
      return;
    }
    if (passwordForm.current !== currentUser.password) {
      alert("Current password is incorrect.");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      alert("New passwords do not match.");
      return;
    }
    
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, password: passwordForm.new } : u);
    setUsers(updatedUsers);
    alert("Password updated successfully!");
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

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
              <div className={styles.formGroup}>
                <label className={styles.label}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPass ? "text" : "password"} 
                    className={styles.input} 
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
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
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm New Password</label>
                <input 
                  type="password" 
                  className={styles.input} 
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                />
              </div>
              <button className={styles.primaryBtn} onClick={handlePasswordChange} style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
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
