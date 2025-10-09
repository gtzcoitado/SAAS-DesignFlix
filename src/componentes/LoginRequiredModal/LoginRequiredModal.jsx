import React from 'react';
import Modal from '../Modal/Modal';
import { useNavigation } from '../../context/NavigationContext';
import styles from './LoginRequiredModal.module.css';

const LoginRequiredModal = ({ isOpen, onClose }) => {
  const { navigateTo } = useNavigation();

  const handleGoToLogin = () => {
    onClose();
    navigateTo('login');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <h3>Login Required</h3>
        <p>You must be logged in to download prints.</p>
        <button 
          className={styles.loginButton} 
          onClick={handleGoToLogin}
        >
          Go to Sign In
        </button>
      </div>
    </Modal>
  );
};

export default LoginRequiredModal;