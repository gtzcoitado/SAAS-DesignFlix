import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../componentes/Navbar/Navbar';
import Footer from '../../componentes/Footer/Footer';
import PaymentRequiredModal from '../../componentes/PaymentRequiredModal/PaymentRequiredModal';
import { useNavigation } from '../../context/NavigationContext';
import styles from './PricingPage.module.css';
import billingImage from '../../assets/billing.png';

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="#E50914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const plans = {
  Weekly: { name: 'Weekly', price: 7.99, period: 'week' },
  Monthly: { name: 'Monthly', price: 19.99, period: 'month' },
  Quarterly: { name: 'Quarterly', price: 49.99, period: 'quarter' },
};

const PricingPage = () => {
  const { isLoggedIn } = useNavigation();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  // 1. O estado de controle do card ativo voltou, com 'quarterly' como padrão
  const [activeCard, setActiveCard] = useState('quarterly');

  const handleSelectPlan = (planName) => {
    if (!isLoggedIn) {
      setIsPaymentModalOpen(true);
      return;
    }
    const selectedPlan = plans[planName];
    navigate('/payment', { state: { plan: selectedPlan } });
  };

  return (
    <>
      <div className={`${styles.pricingPage} ${styles.billingPage}`} style={{ backgroundImage: `url(${billingImage})` }}>
        <Navbar />
        <main className={styles.mainContent}>
          <header className={styles.pageHeader}>
            <h1>Choose Your Plan</h1>
            <p>Join Design Flix and get unlimited access to thousands of exclusive prints. Cancel anytime.</p>
          </header>

          {/* 2. Eventos de rato para controlar o estado do card ativo */}
          <div 
            className={styles.pricingGrid}
            onMouseLeave={() => setActiveCard('quarterly')} // Volta para o padrão ao sair
          >
            {/* Card 1: Weekly */}
            <div 
              className={`${styles.pricingCard} ${activeCard === 'weekly' ? styles.active : ''}`}
              onMouseEnter={() => setActiveCard('weekly')}
            >
              <div className={styles.cardHeader}>
                <h3>Weekly</h3>
                <p className={styles.price}>$7.99<span className={styles.pricePeriod}>/week</span></p>
              </div>
              <ul className={styles.featuresList}>
                <li><CheckIcon /> <span>Limited catalog access</span></li>
                <li><CheckIcon /> <span>Quick platform trial</span></li>
              </ul> 
              <button onClick={() => handleSelectPlan('Weekly')} className={`${styles.selectButton} ${styles.secondaryButton}`}>
                Select Plan
              </button>
            </div>

            {/* Card 2: Monthly */}
            <div 
              className={`${styles.pricingCard} ${activeCard === 'monthly' ? styles.active : ''}`}
              onMouseEnter={() => setActiveCard('monthly')}
            >
              <div className={styles.cardHeader}>
                <h3>Monthly</h3>
                <p className={styles.price}>$19.99<span className={styles.pricePeriod}>/month</span></p>
              </div>
              <ul className={styles.featuresList}>
                <li><CheckIcon /> <span>Unlimited access to all prints</span></li>
                <li><CheckIcon /> <span>Unrestricted downloads</span></li>
                <li><CheckIcon /> <span>Best value for money</span></li>
              </ul>
              {/* O botão primário ainda pode ser usado para indicar a recomendação de custo-benefício */}
              <button onClick={() => handleSelectPlan('Monthly')} className={`${styles.selectButton} ${styles.primaryButton}`}>
                Select Plan
              </button>
            </div>

            {/* Card 3: Quarterly */}
            <div 
              className={`${styles.pricingCard} ${activeCard === 'quarterly' ? styles.active : ''}`}
              onMouseEnter={() => setActiveCard('quarterly')}
            >
              <div className={styles.vipBadge}>VIP Deal!</div>
              <div className={styles.cardHeader}>
                <h3>Quarterly</h3>
                <p className={styles.price}>$49.99<span className={styles.pricePeriod}>/quarter</span></p>
              </div>
              <ul className={styles.featuresList}>
                <li><CheckIcon /> <span>Unlimited access to all prints</span></li>
                <li><CheckIcon /> <span>Unrestricted downloads</span></li>
                <li><CheckIcon /> <span>Best value</span></li>
                <li><CheckIcon /> <span>VIP raffle entry for a free month</span></li>
              </ul>
              <button onClick={() => handleSelectPlan('Quarterly')} className={`${styles.selectButton} ${styles.secondaryButton}`}>
                Select Plan
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      <PaymentRequiredModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </>
  );
};

export default PricingPage;