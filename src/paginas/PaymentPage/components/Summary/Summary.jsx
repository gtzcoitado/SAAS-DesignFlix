import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Summary.module.css';
import logoImage from '@/assets/logo-designflix.png';

// 1. Receba o 'plan' como uma prop
const Summary = ({ plan }) => {
  const navigate = useNavigate();
  
  // 2. Formata o preço para ter sempre duas casas decimais
  const formattedPrice = plan.price.toFixed(2);

  return (
    <div className={styles.leftPanel}>
      <div className={styles.summaryContentWrapper}>
        <div className={styles.backToPlans}>
          <button onClick={() => navigate('/pricing')} className={styles.backButton}>
            ← Back to Plans
          </button>
          <div className={styles.logo}>
            <img src={logoImage} alt="Design Flix Logo" className={styles.logoImage} />
          </div>
        </div>
        
        {/* 3. Use os dados do plano para exibir as informações dinamicamente */}
        <div className={styles.summaryDetails}>
          <p className={styles.smallTitle}>Subscribe to {plan.name}</p>
          <div className={styles.priceContainer}>
            <p className={styles.totalPrice}>US$ {formattedPrice}</p>
            <p className={styles.perMonth}>per {plan.period}</p>
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={styles.lineItem}>
            <p className={styles.itemDescription}>{plan.name} subscription</p>
            <p className={styles.itemPrice}>US$ {formattedPrice}</p>
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={styles.lineItem}>
            <p className={styles.itemDescription}>Subtotal</p>
            <p className={styles.itemPrice}>US$ {formattedPrice}</p>
          </div>
          <div className={styles.lineItem}>
            <p className={styles.itemDescription}>Tax</p>
            <p className={styles.itemPrice}>US$ 0.00</p>
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={`${styles.lineItem} ${styles.total}`}>
            <p className={styles.totalText}>Total due today</p>
            <p className={styles.totalPriceText}>US$ {formattedPrice}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;