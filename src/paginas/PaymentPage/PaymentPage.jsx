import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PaymentPage.module.css';
import Summary from './components/Summary/Summary';
import Payment from './components/Payment/Payment';

const PaymentPage = () => {
  const location = useLocation();
  const selectedPlan = location.state?.plan || { 
    name: 'Monthly', 
    price: 19.99, 
    period: 'month' 
  };

  return (
    <div className={styles.paymentPage}>
      <div className={styles.splitScreen}>
        <Summary plan={selectedPlan} />
        <Payment plan={selectedPlan} />
      </div>
    </div>
  );
};

export default PaymentPage;