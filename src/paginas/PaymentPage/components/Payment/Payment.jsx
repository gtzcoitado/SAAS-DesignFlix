import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import styles from './Payment.module.css';
import payImage from '@/assets/pay.png';

const Payment = ({ plan }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayPalSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obter o token de autenticação
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to subscribe');
      }

      console.log('🚀 Creating subscription for plan:', plan.name);

      // Chamar a Edge Function
      const { data, error: functionError } = await supabase.functions.invoke(
        'create-subscription',
        {
          body: { 
            planName: plan.name 
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );

      console.log('📦 Function response:', data);

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw new Error(functionError.message || 'Failed to create subscription');
      }

      if (data?.error) {
        console.error('❌ API error:', data.error);
        throw new Error(data.error);
      }

      console.log('✅ Subscription created:', data);

      // Redirecionar para a URL de aprovação do PayPal
      if (data?.approvalUrl) {
        console.log('🔄 Redirecting to PayPal:', data.approvalUrl);
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No approval URL received from PayPal');
      }

    } catch (err) {
      console.error('❌ Error creating subscription:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
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
          <button 
            className={styles.paypalButton}
            onClick={handlePayPalSubscription}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                  <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.806.806 0 01-.795.679H7.72a.483.483 0 01-.477-.558L7.418 21h1.519l.95-6.02h1.385c4.678 0 7.75-2.203 8.796-6.502z"/>
                  <path d="M2.379 5.5h11.72c1.715 0 3.093.697 3.843 2.032.3.533.473 1.162.473 1.859 0 .152-.01.305-.03.458-.741 3.806-3.276 5.12-6.514 5.12H9.577a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.806.806 0 01-.795.679H3.945c-.304 0-.54-.268-.477-.558l2.91-18.633z"/>
                </svg>
                Subscribe with PayPal
              </>
            )}
          </button>

          <div className={styles.paypalInfo}>
            <small>Powered by</small>
            <svg width="60" height="16" viewBox="0 0 101 32" fill="#003087" style={{ marginLeft: '8px' }}>
              <path d="M12.237 2.8H4.424c-.54 0-1.001.39-1.085.92L.078 26.073c-.063.4.24.76.65.76h4.74c.382 0 .709-.275.767-.648l.814-5.152c.084-.53.545-.92 1.085-.92h2.502c5.205 0 8.217-2.52 9.003-7.52.356-2.184.014-3.9-1.014-5.1C17.43 4.28 15.283 2.8 12.237 2.8z"/>
            </svg>
          </div>
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