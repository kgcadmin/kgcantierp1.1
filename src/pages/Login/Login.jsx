import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
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
  const [step, setStep] = useState('credentials'); // 'credentials' | '2fa'
  const [otp, setOtp] = useState('');
  const [displayedOTP, setDisplayedOTP] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 min countdown
  const [sessionError, setSessionError] = useState('');
  const [sessionUserId, setSessionUserId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const { login, currentUser, systemConfig, verifyOTP, pendingTwoFAUser, clearOtherSessions } = useContext(AppContext);
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  // Countdown timer for OTP
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

  // Resend cooldown timer
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
    setSessionError('');
    
    try {
      const result = await login(email, password);

      if (result.status === 'invalid') {
        setError('Invalid email or password');
      } else if (result.status === 'session_limit') {
        setSessionError(`This account is already logged in on ${result.count} device(s). Maximum allowed is 3. Please log out from another device first.`);
        setSessionUserId(result.userId);
      } else if (result.status === '2fa') {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setOtpTimer(300);
        setStep('2fa');
      } else if (result.status === 'error') {
        setError(result.message || 'Failed to send verification email. Please try again.');
      } else if (result.status === 'ok') {
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    const result = await verifyOTP(otp);
    if (result.status === 'ok') {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Incorrect code. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    // Re-trigger login to get a new OTP
    const result = await login(email, password);
    if (result.status === '2fa') {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setOtpTimer(300);
    }
  };

  if (currentUser) return <Navigate to={from} replace />;

  const fmtTimer = `${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, '0')}`;

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

        {step === 'credentials' && (
          <>
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

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              {sessionError && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', background: 'rgba(245,158,11,0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#f59e0b', fontSize: '0.875rem', lineHeight: 1.4 }}>
                    <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} /> {sessionError}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      clearOtherSessions(sessionUserId);
                      setSessionError('');
                      setSessionUserId(null);
                      // Auto-login after clearing
                      handleLogin({ preventDefault: () => {} });
                    }}
                    style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', alignSelf: 'flex-start' }}
                  >
                    Log out of all other devices
                  </button>
                </div>
              )}

              <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
            </form>
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
                A 6-digit code was sent to <strong>{maskEmail(email)}</strong>
              </p>
            </div>

            {showToast && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', color: '#059669', fontSize: '0.875rem', fontWeight: 500 }}>
                Verification code sent successfully to your email.
              </div>
            )}

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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span>Expires in <strong style={{ color: otpTimer < 60 ? '#ef4444' : 'var(--primary)' }}>{fmtTimer}</strong></span>
                <button 
                  type="button" 
                  onClick={async () => {
                    if (resendCooldown > 0) return;
                    setResendCooldown(30);
                    handleResendOTP();
                  }} 
                  disabled={resendCooldown > 0}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: resendCooldown > 0 ? 'var(--text-secondary)' : 'var(--primary)', 
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    fontWeight: 600,
                    opacity: resendCooldown > 0 ? 0.6 : 1
                  }}
                >
                  <RefreshCw size={13} className={resendCooldown > 0 ? styles.spin : ''} /> 
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <button type="submit" className={styles.submitBtn}>Verify & Sign In</button>
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
