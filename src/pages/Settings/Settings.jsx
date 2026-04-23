import React, { useState } from 'react';
import { User, Palette, Save } from 'lucide-react';
import Card from '../../components/Card/Card';
import styles from './Settings.module.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('light');

  return (
    <div className={styles.settingsPage}>
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
          </nav>
        </Card>

        <div className={styles.mainArea}>
          {activeTab === 'profile' && (
            <Card className={styles.settingsCard}>
              <h2 className={styles.cardTitle}>Profile Information</h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input type="text" className={styles.input} defaultValue="Admin User" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input type="email" className={styles.input} defaultValue="admin@university.edu" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Role</label>
                <input type="text" className={styles.input} defaultValue="System Administrator" disabled />
              </div>
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
