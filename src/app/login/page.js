'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // === UPDATE PENTING DI SINI ===
      // Simpan Token ke Cookie (Agar Middleware bisa baca)
      // Expired dalam 1 hari (86400 detik)
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

      // Redirect ke Dashboard
      router.push('/app');
      
    } catch (err) {
      setError('Terjadi kesalahan: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
        <div className={styles.logoSection}>
          <img src="/logo.png" alt="API Logo" className={styles.logoImage} />
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              <span className={styles.icon}>✉</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              <span className={styles.icon}>🔒</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
    </div>
  );
}