import React, { useState } from 'react';
import styles from './SignUpPage.module.css';
import backgroundImage from '@/assets/signup.png'; 
import { useNavigation } from '../../context/NavigationContext';
import { supabase } from '../../supabaseClient';

// 1. Importe o novo modal
import SuccessModal from './components/SuccessModal/SuccessModal';

const SignUpPage = () => {
  const { navigateTo } = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Crie um estado para controlar a visibilidade do modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        throw error;
      }
      
      // 3. Em vez do alert, abra o modal
      setIsModalOpen(true);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Crie uma função para fechar o modal e navegar para o login
  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigateTo('login');
  };

  return (
    <>
      {/* 5. Renderize o modal aqui */}
      <SuccessModal isOpen={isModalOpen} onClose={handleCloseModal} />

      <div className={styles.signUpPage} style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className={styles.overlay}></div>
        <header className={styles.header}></header>
        <main className={styles.signUpContainer}>
          <div className={styles.signUpBox}>
            <button className={styles.backButton} onClick={() => navigateTo('home')}>
              Back to Home
            </button>
            <h2>Sign Up</h2>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <form className={styles.signUpForm} onSubmit={handleSignUpSubmit}>
              <input 
                type="text" 
                placeholder="Full Name" 
                className={styles.inputField} 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
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
              <button type="submit" className={styles.signUpButton} disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>
            <p className={styles.signInText}>
              Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('login'); }}>Sign in now</a>.
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default SignUpPage;