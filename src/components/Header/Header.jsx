import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, Menu, Calendar } from 'lucide-react';

import styles from './Header.module.css';
import { AppContext } from '../../context/AppContext';

const Header = ({ onMenuClick }) => {

  const { currentUser, logout, recentActivities, academicYear, setAcademicYear } = useContext(AppContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close both dropdowns when clicking anywhere outside them
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`glass-panel ${styles.header}`}>
      <button className={styles.menuBtn} onClick={onMenuClick}>
        <Menu size={24} />
      </button>
      <div className={styles.logoPlaceholder} style={{ flex: 1 }}></div>

      <div className={styles.actions}>
        <div className={styles.yearSelector}>
          <Calendar size={16} color="var(--primary)" />
          <select 
            value={academicYear} 
            onChange={(e) => setAcademicYear(e.target.value)}
            className={styles.yearSelect}
          >
            <option value="2025-26">2025-26</option>
            <option value="2026-27">2026-27</option>
            <option value="2027-28">2027-28</option>
          </select>
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className={styles.iconBtn}
            onClick={() => { setShowNotifications(prev => !prev); setShowProfileMenu(false); }}
          >
            <Bell size={20} />
            {recentActivities?.filter(act => !act.audience || ['Admin', 'Management', 'Office Staff'].includes(currentUser?.role) || act.audience.includes(currentUser?.role || 'Guest')).length > 0 && (
              <span className={styles.badge}>{Math.min(recentActivities.filter(act => !act.audience || ['Admin', 'Management', 'Office Staff'].includes(currentUser?.role) || act.audience.includes(currentUser?.role || 'Guest')).length, 9)}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>Recent Notifications</div>
              {recentActivities?.filter(act => !act.audience || ['Admin', 'Management', 'Office Staff'].includes(currentUser?.role) || act.audience.includes(currentUser?.role || 'Guest')).slice(0, 4).map(act => (
                <div key={act.id} className={styles.dropdownItem} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{act.action}</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{act.time} • {act.user}</p>
                </div>
              ))}
              {recentActivities?.filter(act => !act.audience || act.audience.includes(currentUser?.role || 'Guest')).length === 0 && (
                <div className={styles.dropdownItem} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>No new notifications</div>
              )}
              <div
                className={styles.dropdownItem}
                style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => { navigate('/communication'); setShowNotifications(false); }}
              >
                View All Activity
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            className={styles.profile}
            onClick={() => { setShowProfileMenu(prev => !prev); setShowNotifications(false); }}
          >
            <div className={styles.avatar}>
              {currentUser?.name ? currentUser.name.charAt(0) : <User size={20} />}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{currentUser ? currentUser.name : 'Guest User'}</span>
              <span className={styles.userRole}>{currentUser ? currentUser.role : 'Guest'}</span>
            </div>
          </div>

          {showProfileMenu && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader} style={{ background: 'var(--surface-hover)' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{currentUser?.name}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{currentUser?.email}</p>
              </div>
              <button
                className={styles.dropdownItem}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
              >
                <Settings size={16} /> Account Settings
              </button>
              <button
                className={styles.dropdownItem}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', borderTop: '1px solid var(--border-light)' }}
                onClick={logout}
              >
                <LogOut size={16} /> Secure Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
