import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './PaymentSuccess.module.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [message, setMessage] = useState('Processing your subscription...');
  const planName = searchParams.get('plan');

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10; // 10 tentativas = 20 segundos no máximo

    const checkSubscriptionStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setStatus('error');
          setMessage('User not found. Please login again.');
          return;
        }

        // Verificar o status da assinatura
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_subscribed, paypal_subscription_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setStatus('error');
          setMessage('Error verifying subscription status.');
          return;
        }

        if (profile?.is_subscribed) {
          setStatus('success');
          setMessage(`Your ${planName || ''} subscription is now active!`);
          
          // Redirecionar para o dashboard após 3 segundos
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          // Ainda não ativado, tentar novamente
          attempts++;
          
          if (attempts < maxAttempts) {
            setStatus('processing');
            setMessage(`Processing your payment... (${attempts}/${maxAttempts})`);
            
            // Tentar novamente em 2 segundos
            setTimeout(checkSubscriptionStatus, 2000);
          } else {
            // Excedeu o número de tentativas
            setStatus('error');
            setMessage('Payment is taking longer than expected. Please check your email or contact support.');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus('error');
        setMessage('An error occurred. Please contact support if you were charged.');
      }
    };

    // Aguardar 2 segundos antes de começar a verificar
    setTimeout(checkSubscriptionStatus, 2000);
  }, [planName, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'checking' && (
          <>
            <div className={styles.spinner}></div>
            <h2>Processing Payment</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'processing' && (
          <>
            <div className={styles.spinner}></div>
            <h2>Almost There!</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <h2>Payment Successful!</h2>
            <p>{message}</p>
            <p className={styles.redirectText}>Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={styles.errorIcon}>✕</div>
            <h2>Something Went Wrong</h2>
            <p>{message}</p>
            <button 
              className={styles.button}
              onClick={() => navigate('/pricing')}
            >
              Back to Pricing
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;