import React, { useState } from 'react';
import { X, UserCheck, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth.js';
import styles from './AuthModal.module.css';

export const AuthModal = ({ isOpen, onClose }) => {
  const { loginWithEmail, registerUser, loginAsDemo } = useAuth();
  const [mode, setMode] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('3rd Semester');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginWithEmail(loginEmail);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Login failed. Check your email or use the CUCC controller profile.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await registerUser({
      name,
      email: regEmail,
      studentId,
      department,
      semester
    });
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close authentication modal"
          >
            <X style={{ width: '1rem', height: '1rem' }} />
          </button>

          <div className={styles.brandRow}>
            <div className={styles.logoBox}>
              <img
                src="/city-university-logo.jpg"
                alt="City University Official Logo"
                className={styles.logoImg}
              />
            </div>
            <div>
              <span className={styles.brandKicker}>City University • CUCC</span>
              <span className={styles.brandMotto}>...creating a culture of excellence</span>
            </div>
          </div>

          <h3 className={styles.headerTitle}>
            {mode === 'login' ? 'CUCC Controller Sign In' : 'Student Portal Registration'}
          </h3>
          <p className={styles.headerSubtitle}>
            Manage Computer Club wings, event passes &amp; official campus circulars.
          </p>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`${styles.tabBtn} ${mode === 'login' ? styles.tabBtnActive : ''}`}
          >
            Log In with Email
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`${styles.tabBtn} ${mode === 'register' ? styles.tabBtnActive : ''}`}
          >
            New Student Sign Up
          </button>
        </div>

        <div className={styles.body}>
          {error && (
            <div className={styles.errorBox}>
              <AlertCircle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className={styles.formStack}>
              <div>
                <label className={styles.fieldLabel}>University Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. controller.tech@cityuniversity.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={styles.fieldInput}
                />
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                <LogIn style={{ width: '1rem', height: '1rem' }} />
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>

              <div className={styles.demoSection}>
                <p className={styles.demoLabel}>CUCC Controller Session:</p>
                <div className={styles.demoList}>
                  <button
                    type="button"
                    onClick={() => {
                      loginAsDemo();
                      onClose();
                    }}
                    className={styles.demoControllerBtn}
                  >
                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <UserCheck style={{ width: '0.875rem', height: '0.875rem' }} />
                      Controller (CUCC) — Tanvir Ahmed
                    </span>
                    <span className={styles.demoEmail}>controller.tech@cityuniversity.edu</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className={styles.regFormStack}>
              <div>
                <label className={styles.fieldLabel}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sadia Islam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.fieldInput}
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>Student ID Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CU-24-CSE-099"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className={styles.fieldInput}
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>University Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sadia@cityuniversity.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.twoCol}>
                <div>
                  <label className={styles.fieldLabel}>Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={styles.fieldSelect}
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Electrical & Electronic Eng.">EEE</option>
                    <option value="Civil Engineering">Civil</option>
                    <option value="Business Administration">BBA</option>
                    <option value="English & Humanities">English</option>
                    <option value="Law & Justice">Law</option>
                  </select>
                </div>

                <div>
                  <label className={styles.fieldLabel}>Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className={styles.fieldSelect}
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
                style={{ marginTop: '0.5rem' }}
              >
                <UserPlus style={{ width: '1rem', height: '1rem' }} />
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
