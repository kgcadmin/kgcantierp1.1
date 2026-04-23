import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, GraduationCap, LogOut, Settings, Building2, CalendarDays, Wallet, FileText, Banknote, PenTool, Clock, Home, Library, MessageSquare, ShieldAlert } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import styles from './Sidebar.module.css';

const Sidebar = ({ isVisible, onClose }) => {

  const navigate = useNavigate();
  const { currentUser, logout, systemConfig } = useContext(AppContext);

  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'SIS (Students)', path: '/students', icon: <Users size={20} /> },
    { name: 'Faculty', path: '/faculty', icon: <GraduationCap size={20} /> },
    { name: 'Staff', path: '/staff', icon: <Users size={20} /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
    { name: 'Batches', path: '/batches', icon: <CalendarDays size={20} /> },
    { name: 'Academic Setup', path: '/academic-setup', icon: <Building2 size={20} /> },
    { name: 'Payroll', path: '/payroll', icon: <Wallet size={20} /> },
    { name: 'Documents', path: '/documents', icon: <FileText size={20} /> },
    { name: 'Fees', path: '/fees', icon: <Banknote size={20} /> },
    { name: 'Exams', path: '/exams', icon: <PenTool size={20} /> },
    { name: 'Timetable', path: '/timetable', icon: <Clock size={20} /> },
    { name: 'Hostel', path: '/hostel', icon: <Home size={20} /> },
    { name: 'Library', path: '/library', icon: <Library size={20} /> },
    { name: 'Communication', path: '/communication', icon: <MessageSquare size={20} /> },
    { name: 'System', path: '/system', icon: <ShieldAlert size={20} /> },
    { name: 'Finance', path: '/finance', icon: <Banknote size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const getFilteredNavItems = () => {
    if (!currentUser) return [];
    if (['Admin', 'Management'].includes(currentUser.role)) return navItems;
    
    const roleMap = {
      'Faculty': ['Dashboard', 'SIS (Students)', 'Courses', 'Exams', 'Timetable', 'Payroll', 'Communication'],
      'Student': ['Dashboard', 'Fees', 'Timetable', 'Exams', 'Library', 'Hostel', 'Documents', 'Communication'],
      'Office Staff': ['Dashboard', 'SIS (Students)', 'Staff', 'Payroll', 'Documents', 'Fees', 'Communication']
    };

    const allowed = roleMap[currentUser.role] || [];
    return navItems.filter(item => allowed.includes(item.name));
  };

  const visibleNavItems = getFilteredNavItems();

  return (
    <aside className={`glass-panel ${styles.sidebar} ${isVisible ? styles.mobileVisible : ''}`}>
      <div className={styles.logoContainer} onClick={() => { navigate('/dashboard'); onClose?.(); }} style={{ cursor: 'pointer' }}>

        {systemConfig?.collegeLogo ? (
          <img src={systemConfig.collegeLogo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
        ) : (
          <GraduationCap className={styles.logoIcon} />
        )}
        <h2 className={`${styles.logoText} gradient-text`}>{systemConfig?.collegeShortName || 'KGC'} ERP</h2>
      </div>

      <nav className={styles.nav}>
        {visibleNavItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}

          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.logoutContainer}>
        {currentUser && (
          <div style={{ padding: '0 1rem 1rem 1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ margin: 0, fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>{currentUser.name}</p>
            <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{currentUser.role}</p>
          </div>
        )}
        <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
