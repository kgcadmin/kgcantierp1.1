import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingTwoFA, setPendingTwoFA] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('kgc_auth_user');
    const token = localStorage.getItem('kgc_auth_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      
      if (res.requiresTwoFA) {
        setPendingTwoFA({ email: res.email });
        // Trigger OTP generation
        await api.auth.generateOTP(res.email);
        return { status: '2fa' };
      }

      if (res.token) {
        localStorage.setItem('kgc_auth_token', res.token);
        localStorage.setItem('kgc_auth_user', JSON.stringify(res.user));
        setUser(res.user);
        return { status: 'ok' };
      }
      return { status: 'error', message: res.error || 'Login failed' };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await api.auth.signup(userData);
      if (res.success) return { status: 'ok' };
      return { status: 'error', message: res.error || 'Signup failed' };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  };

  const verifyOTP = async (otp) => {
    try {
      if (!pendingTwoFA) return { status: 'error', message: 'No pending session' };
      const res = await api.auth.verifyOTP(pendingTwoFA.email, otp);
      
      if (res.token) {
        localStorage.setItem('kgc_auth_token', res.token);
        localStorage.setItem('kgc_auth_user', JSON.stringify(res.user));
        setUser(res.user);
        setPendingTwoFA(null);
        return { status: 'ok' };
      }
      return { status: 'error', message: res.error || 'Invalid OTP' };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('kgc_auth_token');
    localStorage.removeItem('kgc_auth_user');
    setUser(null);
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      return await res.json();
    } catch (err) {
      return { error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyOTP, logout, resetPassword, pendingTwoFA }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
