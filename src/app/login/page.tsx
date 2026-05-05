"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Zap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    // For demo purposes, we accept any password if the email matches a mock user
    const success = await login(email, password);
    
    if (!success) {
      setError('Invalid email or password. Please check your credentials.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.blob}></div>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <Zap size={32} fill="currentColor" />
          </div>
          <h1>Solar CRM</h1>
          <p>Enterprise Order Management</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBadge}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input 
                type="email" 
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoggingIn}>
            {isLoggingIn ? (
              <Loader2 className={styles.spinner} size={20} />
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Don't have an account? <span>Contact Administrator</span></p>
        </div>
      </div>

      <div className={styles.demoCredits}>
        <p>Demo Accounts:</p>
        <code>sales@tnsolarsolution.com</code>
        <code>manager@tnsolarsolution.com</code>
      </div>
    </div>
  );
}
