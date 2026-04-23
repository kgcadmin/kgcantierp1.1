import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import styles from './MainLayout.module.css';
import { AppContext } from '../context/AppContext';
import { useState } from 'react';


const MainLayout = () => {
  const { currentUser } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar isVisible={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {isSidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 900, backdropFilter: 'blur(4px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={styles.mainContent}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>

  );
};

export default MainLayout;
