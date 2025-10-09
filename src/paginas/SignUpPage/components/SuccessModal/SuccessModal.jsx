import React from 'react';
import Modal from '../../../../componentes/Modal/Modal'; // Importa o modal base
import styles from './SuccessModal.module.css';

// Ícone SVG de um envelope
const EnvelopeIcon = () => (
    <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

const SuccessModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <EnvelopeIcon />
        <h2 className={styles.title}>Check your email!</h2>
        <p className={styles.message}>
            We've sent a confirmation link to your email address. Please click the link to complete your registration.
        </p>
        <button 
          className={styles.actionButton} 
          onClick={onClose}
        >
          Go to Login
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;