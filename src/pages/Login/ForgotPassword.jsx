import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import { Mail, KeyRound, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../utils/api';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.generateOTP(email);
      if (res.success) {
        setStep(2);
      } else {
        setError(res.error || "Failed to send code. Make sure the email is correct.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await resetPassword(email, otp, newPassword);
      if (res.success) {
        setStep(3);
      } else {
        setError(res.error || "Reset failed. Check your code.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.logo}>KGC</div>
          <h1>Reset Password</h1>
          <p>
            {step === 1 && "Enter your email to receive a verification code."}
            {step === 2 && `A 6-digit code has been sent to ${email}`}
            {step === 3 && "Your password has been reset successfully."}
          </p>
        </div>

        {error && (
          <div className={styles.errorMessage} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} /> {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWithIcon}>
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="name@college.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
            <Link to="/login" className={styles.backLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label>Verification Code</label>
              <div className={styles.inputWithIcon}>
                <ShieldCheck size={18} />
                <input
                  type="text"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>New Password</label>
              <div className={styles.inputWithIcon}>
                <KeyRound size={18} />
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? "Resetting..." : "Update Password"}
            </button>
            <button type="button" onClick={() => setStep(1)} className={styles.backLink} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <ArrowLeft size={16} /> Use different email
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
            </div>
            <button 
              onClick={() => navigate('/login')} 
              className={styles.loginButton}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
