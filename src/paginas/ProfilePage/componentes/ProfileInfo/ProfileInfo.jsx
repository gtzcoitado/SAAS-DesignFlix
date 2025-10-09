import React from 'react';
import styles from './ProfileInfo.module.css';

// Componente do ícone de usuário
const UserIcon = () => (
  <svg className={styles.userIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 22.0001V20.0001C20 18.9392 19.5786 17.9206 18.8284 17.1705C18.0783 16.4203 17.0609 16.0001 16 16.0001H8C6.93913 16.0001 5.92172 16.4203 5.17157 17.1705C4.42143 17.9206 4 18.9392 4 20.0001V22.0001" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 1. O componente agora aceita 'name', 'email' e 'memberSince'
const ProfileInfo = ({ name, email, memberSince }) => {
  return (
    <div className={styles.profileCard}>
      <div className={styles.userInfo}>
        <div className={styles.userIconContainer}>
          <UserIcon />
        </div>
        <div className={styles.userDetails}>
          {/* 2. Exibe os dados recebidos via props */}
          <h3 className={styles.userName}>{name}</h3>
          <p className={styles.userEmail}>{email}</p>
        </div>
      </div>
      <div className={styles.accountInfo}>
        <h4>Account Details</h4>
        {/* 3. Exibe a data formatada de quando o membro se juntou */}
        <p>Member since: {memberSince}</p>
        <button className={styles.changePasswordButton}>
          Change Password
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;