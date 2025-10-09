import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { supabase } from '../../../../supabaseClient';
import styles from './Payment.module.css';
import payImage from '@/assets/pay.png';

const Payment = ({ plan }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const cardElementOptions = {
    style: {
      base: {
        color: "#ffffff",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js ainda não carregou.
      return;
    }
    setProcessing(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not logged in");

      // Chama a Edge Function para criar a intenção de pagamento
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ plan }),
      });

      const { clientSecret, error: intentError } = await response.json();
      if (intentError) throw new Error(intentError);

      // Finaliza o pagamento no frontend com o secret do backend
      const { paymentIntent, error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { email: email }
        }
      });

      if (paymentError) throw new Error(paymentError.message);

      // O webhook do Stripe irá tratar da atualização do perfil do utilizador
      if (paymentIntent.status === 'succeeded') {
        alert("Payment successful! Your subscription is now active.");
        navigate('/dashboard');
      }

    } catch (err) {
      setError(`Payment failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.rightPanel} style={{ backgroundImage: `url(${payImage})` }}>
      <form className={styles.paymentForm} onSubmit={handlePayment}>
        <h1>Payment</h1>
        <p>Complete your payment using your credit card.</p>
        
        <input 
          type="email" 
          placeholder="Email" 
          className={styles.inputField} 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        <div className={styles.cardElementContainer}>
          <CardElement options={cardElementOptions} />
        </div>
        
        {error && <p className={styles.errorMessage}>{error}</p>}

        <button type="submit" className={styles.payButton} disabled={processing || !stripe}>
          {processing ? 'Processing...' : `Pay US$ ${plan.price.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

export default Payment;