import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importe useNavigate
import styles from './LoginPage.module.css';
import backgroundImage from '@/assets/fundo.png';
import { supabase } from '../../supabaseClient';

const LoginPage = () => {
  const navigate = useNavigate(); // 2. Inicialize o hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }
      
      // 3. Use navigate para redirecionar
      navigate('/dashboard');
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.overlay}></div>
      <header className={styles.header}></header>
      <main className={styles.loginContainer}>
        <div className={styles.loginBox}>
          {/* 3. Botão de voltar também usa navigate */}
          <button className={styles.backButton} onClick={() => navigate('/')}>
            Back to Home
          </button>
          <h2>Sign In</h2>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <form className={styles.loginForm} onSubmit={handleLoginSubmit}>
            <input 
              type="email" 
              placeholder="Email" 
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <div className={styles.formOptions}>
              <label className={styles.checkboxContainer}>
                <input type="checkbox" /> Remember me
                <span className={styles.checkmark}></span>
              </label>
              <a href="#" className={styles.helpLink}>Need help?</a>
            </div>
          </form>
          <div className={styles.signupInfo}>
            <p className={styles.signupText}>
              New to Design Flix? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Sign up now</a>.
            </p>
            <p className={styles.recaptchaText}>
              This page is protected by Google reCAPTCHA to ensure you're not a bot.
              <a href="#"> Learn more.</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;