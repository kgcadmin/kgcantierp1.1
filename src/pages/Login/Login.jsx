import React, { useState, useContext } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, currentUser, systemConfig } = useContext(AppContext);
  const location = useLocation();
  // Where to go after login — defaults to /dashboard
  const from = location.state?.from || '/dashboard';

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid email or password');
    }
  };

  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className={styles.loginContainer}>
      <div className={`glass-panel ${styles.loginCard}`}>
        <div className={styles.logo}>
          {systemConfig?.collegeLogo ? (
            <img src={systemConfig.collegeLogo} alt="Logo" style={{ width: '48px', height: '48px', marginBottom: '1rem', borderRadius: '8px' }} />
          ) : (
            <GraduationCap className={styles.logoIcon} />
          )}
          <h1 className={`${styles.logoText} gradient-text`}>{systemConfig?.collegeShortName || 'KGC'} ERP</h1>
        </div>

        <p className={styles.subtitle}>Sign in to access your institutional portal</p>
        
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input 
                type="email" 
                placeholder="email@institution.edu" 
                className={styles.inputField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className={styles.inputField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p style={{ color: '#d32f2f', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className={styles.submitBtn}>
            Sign In
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
