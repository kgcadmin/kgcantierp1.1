import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ShieldCheck, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

const maskEmail = (email) => {
  if (!email) return '';
  const [user, domain] = email.split('@');
  const masked = user.charAt(0) + '***';
  const [d1, ...rest] = domain.split('.');
  return `${masked}@${d1.charAt(0)}***.${rest.join('.')}`;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('credentials'); // 'credentials' | '2fa'
  const [otpTimer, setOtpTimer] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const { login, verifyOTP, user: currentUser, pendingTwoFA } = useAuth();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const successMessage = location.state?.message;

  useEffect(() => {
    if (step !== '2fa') return;
    if (otpTimer <= 0) {
      setStep('credentials');
      setError('OTP expired. Please login again.');
      return;
    }
    const t = setTimeout(() => setOtpTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, otpTimer]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);

      if (result.status === '2fa') {
        setOtpTimer(300);
        setStep('2fa');
      } else if (result.status === 'ok') {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await verifyOTP(otp);
    if (result.status === 'ok') {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Incorrect code. Please try again.');
    }
    setIsLoading(false);
  };

  if (currentUser) return <Navigate to={from} replace />;

  const fmtTimer = `${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, '0')}`;

  return (
    <div className={styles.loginContainer}>
      <div className={`glass-panel ${styles.loginCard}`}>
        <div className={styles.logo}>
          <GraduationCap className={styles.logoIcon} />
          <h1 className={`${styles.logoText} gradient-text`}>KGC ERP</h1>
        </div>

        {step === 'credentials' && (
          <>
            <p className={styles.subtitle}>Sign in to access your institutional portal</p>
            
            {successMessage && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#059669', fontSize: '0.875rem', textAlign: 'center' }}>
                {successMessage}
              </div>
            )}

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

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Sign In'} <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
              </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
            </p>
          </>
        )}

        {step === '2fa' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <ShieldCheck size={28} color="white" />
              </div>
              <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Two-Factor Verification</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                A 6-digit code was sent to <strong>{maskEmail(pendingTwoFA?.email || email)}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP}>
              <div className={styles.formGroup}>
                <label>Enter Verification Code</label>
                <div className={styles.inputWrapper}>
                  <ShieldCheck className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="000000"
                    className={styles.inputField}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    autoFocus
                    required
                    style={{ letterSpacing: '0.4rem', fontSize: '1.25rem', textAlign: 'center' }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span>Expires in <strong style={{ color: otpTimer < 60 ? '#ef4444' : 'var(--primary)' }}>{fmtTimer}</strong></span>
                <button 
                  type="button" 
                  onClick={() => {
                    if (resendCooldown > 0) return;
                    setResendCooldown(30);
                    login(email, password);
                  }} 
                  disabled={resendCooldown > 0}
                  style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? 'var(--text-secondary)' : 'var(--primary)', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <button type="button" onClick={() => { setStep('credentials'); setError(''); setOtp(''); }} style={{ width: '100%', marginTop: '0.75rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                ← Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
