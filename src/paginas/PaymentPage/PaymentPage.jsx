// src/paginas/PaymentPage/PaymentPage.jsx (VERSÃO CORRIGIDA)

import React from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import styles from './PaymentPage.module.css';
import Summary from './components/Summary/Summary';
import Payment from './components/Payment/Payment';

// Use a sua chave publicável (Publishable Key) do Stripe aqui
// Vamos usar a variável de ambiente, mas garanta que o seu .env.local está correto.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); 

const PaymentPage = () => {
  const location = useLocation();
  const selectedPlan = location.state?.plan || { name: 'Monthly', price: 19.99, period: 'month' };

  return (
    <div className={styles.paymentPage}>
      <div className={styles.splitScreen}>
        <Summary plan={selectedPlan} />
        
        {/* A CORREÇÃO MAIS IMPORTANTE ESTÁ AQUI: */}
        {/* O <Elements> PRECISA DE ENVOLVER O COMPONENTE QUE USA O STRIPE */}
        <Elements stripe={stripePromise}>
          <Payment plan={selectedPlan} />
        </Elements>
        
      </div>
    </div>
  );
};

export default PaymentPage;