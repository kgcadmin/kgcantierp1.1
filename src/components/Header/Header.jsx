import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, Menu, Calendar, ShieldCheck } from 'lucide-react';
import styles from './Header.module.css';
import { AppContext } from '../../context/AppContext';

const Header = ({ onMenuClick }) => {

  const { 
    currentUser, logout, recentActivities, academicYear, setAcademicYear,
    leaves, finance, communication, exams, SUPER_ADMIN_EMAIL
  } = useContext(AppContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [inactiveCountdown, setInactiveCountdown] = useState(null); // null = active, N = counting down
  const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;  // 5 minutes
  const WARN_BEFORE_MS = 30 * 1000;            // warn at 30 seconds left
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);
  const warnTimer = useRef(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // ── Inactivity timeout ──
  const resetTimers = useCallback(() => {
    setInactiveCountdown(null);
    clearTimeout(inactivityTimer.current);
    clearTimeout(warnTimer.current);

    warnTimer.current = setTimeout(() => {
      // Start 30-second countdown
      setInactiveCountdown(30);
    }, INACTIVITY_LIMIT_MS - WARN_BEFORE_MS);

    inactivityTimer.current = setTimeout(() => {
      logout();
      navigate('/login', { replace: true, state: { reason: 'inactivity' } });
    }, INACTIVITY_LIMIT_MS);
  }, [logout, navigate]);

  useEffect(() => {
    if (!currentUser) return;
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const handler = () => resetTimers();
    events.forEach(ev => window.addEventListener(ev, handler, { passive: true }));
    resetTimers(); // kick off on mount
    return () => {
      events.forEach(ev => window.removeEventListener(ev, handler));
      clearTimeout(inactivityTimer.current);
      clearTimeout(warnTimer.current);
    };
  }, [currentUser, resetTimers]);

  // Countdown tick
  useEffect(() => {
    if (inactiveCountdown === null) return;
    if (inactiveCountdown <= 0) return;
    const t = setTimeout(() => setInactiveCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [inactiveCountdown]);

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

  const getNotifications = () => {
    let notifs = [];
    const role = currentUser?.role || 'Guest';
    
    // Admins/Management/Office Staff
    if (['Admin', 'Management', 'Office Staff'].includes(role)) {
      const pendingLeaves = leaves?.filter(l => l.status === 'Pending')?.length || 0;
      if (pendingLeaves > 0) {
        notifs.push({ id: 'nl1', title: `${pendingLeaves} Pending Leave Requests`, desc: 'Requires your approval', type: 'alert', link: '/staff' });
      }
      
      if (finance?.pettyCash?.balance < 5000) {
        notifs.push({ id: 'nf1', title: `Low Petty Cash: ₹${finance.pettyCash.balance}`, desc: 'Please refill soon', type: 'warning', link: '/finance' });
      }
    }
    
    // Faculty/Office Staff Tasks
    if (['Faculty', 'Office Staff'].includes(role)) {
      const pendingTasks = communication?.tasks?.filter(t => (t.assignee === currentUser?.name || t.assignee === role) && t.status !== 'Completed')?.length || 0;
      if (pendingTasks > 0) {
        notifs.push({ id: 'nt1', title: `${pendingTasks} Pending Tasks`, desc: 'Check your task list', type: 'alert', link: '/communication' });
      }
    }

    // Students
    if (role === 'Student') {
      const upcomingExams = exams?.filter(e => new Date(e.date) >= new Date())?.length || 0;
      if (upcomingExams > 0) {
        notifs.push({ id: 'ne1', title: `${upcomingExams} Upcoming Exams`, desc: 'Check your schedule', type: 'info', link: '/exams' });
      }
    }

    // Notices (for everyone)
    const recentNotices = communication?.notices?.slice(0, 3) || [];
    recentNotices.forEach(n => {
       if (n.audience === 'All' || n.audience === role || (n.audience === 'Students' && role === 'Student')) {
         notifs.push({ id: `nn_${n.id}`, title: `New Notice: ${n.title}`, desc: `By ${n.author}`, type: 'info', link: '/communication' });
       }
    });

    // Add recent activities as fallback
    const acts = recentActivities?.filter(act => !act.audience || ['Admin', 'Management', 'Office Staff'].includes(role) || act.audience.includes(role)).slice(0, 4) || [];
    
    acts.forEach(act => {
      notifs.push({ id: act.id, title: act.action, desc: `${act.time} • ${act.user}`, type: 'activity', link: '/communication' });
    });

    // Deduplicate by ID
    const uniqueNotifs = [];
    const map = new Map();
    for (const item of notifs) {
        if(!map.has(item.id)){
            map.set(item.id, true);
            uniqueNotifs.push(item);
        }
    }

    return uniqueNotifs.slice(0, 6);
  };

  const dynamicNotifs = getNotifications();

  return (
    <>
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
            {dynamicNotifs.length > 0 && (
              <span className={styles.badge} style={{ fontSize: '0.65rem', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', top: '4px', right: '4px', color: 'white' }}>
                {dynamicNotifs.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.dropdown} style={{ width: '350px' }}>
              <div className={styles.dropdownHeader}>Notifications & Alerts</div>
              {dynamicNotifs.map(n => (
                <div 
                  key={n.id} 
                  className={styles.dropdownItem} 
                  style={{ borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
                  onClick={() => { navigate(n.link || '/'); setShowNotifications(false); }}
                >
                  <div style={{ 
                    minWidth: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    marginTop: '0.35rem',
                    background: n.type === 'alert' || n.type === 'warning' ? 'var(--danger)' : n.type === 'info' ? 'var(--primary)' : 'var(--text-tertiary)' 
                  }}></div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{n.title}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.desc}</p>
                  </div>
                </div>
              ))}
              {dynamicNotifs.length === 0 && (
                <div className={styles.dropdownItem} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem' }}>No new notifications</div>
              )}
              <div
                className={styles.dropdownItem}
                style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', background: 'var(--bg-base)' }}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{currentUser?.name}</p>
                  {currentUser?.email === SUPER_ADMIN_EMAIL && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '2rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white' }}>
                      <ShieldCheck size={10} /> SUPER ADMIN
                    </span>
                  )}
                </div>
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

    {/* ── Inactivity Warning Overlay ── */}
    {inactiveCountdown !== null && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '1.25rem', padding: '2.5rem', textAlign: 'center', maxWidth: '380px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <ShieldCheck size={32} color="#ef4444" />
          </div>
          <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.25rem' }}>Still there?</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem', fontSize: '0.9rem' }}>You will be logged out due to inactivity in</p>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ef4444', margin: '0 0 1.5rem', fontVariantNumeric: 'tabular-nums' }}>{inactiveCountdown}s</div>
          <button
            onClick={() => resetTimers()}
            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
          >
            I'm here — Stay Logged In
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;
