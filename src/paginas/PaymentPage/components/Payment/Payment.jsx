import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from '../../../../supabaseClient';
import styles from './Payment.module.css';
import payImage from '@/assets/pay.png';

const Payment = ({ plan }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);

  // Configuração inicial do PayPal
  const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "subscription",
    vault: true,
  };

  const createSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not logged in");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ plan }),
      });

      const { subscriptionId: subId, error: subError } = await response.json();
      
      if (subError) throw new Error(subError);
      
      setSubscriptionId(subId);
      return subId;

    } catch (err) {
      setError(`Failed to create subscription: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (data) => {
    try {
      // Aqui você pode fazer uma verificação adicional se quiser
      console.log('Subscription approved:', data.subscriptionID);
      
      alert("Payment successful! Your subscription is now active.");
      navigate('/dashboard');
    } catch (err) {
      setError(`Approval failed: ${err.message}`);
    }
  };

  return (
    <div className={styles.rightPanel} style={{ backgroundImage: `url(${payImage})` }}>
      <div className={styles.paymentForm}>
        <h1>Payment</h1>
        <p>Complete your subscription using PayPal.</p>
        
        <div className={styles.planInfo}>
          <h3>{plan.name} Plan</h3>
          <p className={styles.price}>US$ {plan.price.toFixed(2)}</p>
          <p className={styles.period}>per {plan.period}</p>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.paypalButtonContainer}>
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "gold",
                shape: "rect",
                label: "subscribe"
              }}
              createSubscription={async (data, actions) => {
                const subId = await createSubscription();
                return subId;
              }}
              onApprove={onApprove}
              onError={(err) => {
                console.error('PayPal Error:', err);
                setError('An error occurred with PayPal. Please try again.');
              }}
              disabled={loading}
            />
          </PayPalScriptProvider>
        </div>

        {loading && (
          <div className={styles.loadingOverlay}>
            <p>Processing your subscription...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;