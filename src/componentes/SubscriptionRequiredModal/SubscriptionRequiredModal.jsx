import React from 'react';
import Modal from '../Modal/Modal';
import { useNavigation } from '../../context/NavigationContext';
import styles from './SubscriptionRequiredModal.module.css';

const SubscriptionRequiredModal = ({ isOpen, onClose }) => {
  const { navigateTo } = useNavigation();

  const handleGoToPricing = () => {
    onClose();
    navigateTo('pricing');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <h3>Subscription Required</h3>
        <p>You need to be a premium member to download prints. Choose a plan to get unlimited access!</p>
        <button 
          className={styles.actionButton} 
          onClick={handleGoToPricing}
        >
          View Plans
        </button>
      </div>
    </Modal>
  );
};

export default SubscriptionRequiredModal;