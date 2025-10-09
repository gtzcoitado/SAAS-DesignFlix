import React from 'react';
// 1. IMPORTAMOS O useNavigate PARA LIDAR COM A NAVEGAÇÃO
import { useNavigate } from 'react-router-dom';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  // 2. INICIALIZAMOS O HOOK
  const navigate = useNavigate();

  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroOverlay}></div>
      <div className={styles.heroContent}>
        <h1>Unique Prints to Wear Your Passion.</h1>
        <p>Create, share, or buy exclusive designs from independent artists. Your next favorite t-shirt is here.</p>
        <div className={styles.ctaButtons}>
          {/* 3. ADICIONAMOS O onClick PARA NAVEGAR PARA A PÁGINA DE CADASTRO */}
          <button 
            className={styles.primaryButton} 
            onClick={() => navigate('/signup')}
          >
            Create Free Account
          </button>
          
          {/* 4. ADICIONAMOS O onClick PARA NAVEGAR PARA A PÁGINA DE COLEÇÕES */}
          <button 
            className={styles.secondaryButton}
            onClick={() => navigate('/collections')}
          >
            Browse Prints
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;