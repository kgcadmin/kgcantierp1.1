import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from '../Login/Login.module.css'; // Reuse Login styles

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signup(formData);
    if (result.status === 'ok') {
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } else {
      setError(result.message || 'Registration failed');
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={`glass-panel ${styles.loginCard}`}>
        <div className={styles.logo}>
          <GraduationCap className={styles.logoIcon} />
          <h1 className={`${styles.logoText} gradient-text`}>KGC ERP</h1>
        </div>

        <h2 style={{ color: 'var(--text-primary)', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Create Account</h2>
        <p className={styles.subtitle}>Join the institutional portal</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className={styles.inputField}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="email@institution.edu"
                className={styles.inputField}
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                placeholder="••••••••"
                className={styles.inputField}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Role</label>
            <div className={styles.inputWrapper}>
              <ShieldCheck className={styles.inputIcon} />
              <select 
                name="role" 
                className={styles.inputField} 
                value={formData.role} 
                onChange={handleChange}
                style={{ appearance: 'none', background: 'transparent' }}
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Office Staff">Office Staff</option>
                <option value="Management">Management</option>
              </select>
            </div>
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
            {isLoading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
