import React from 'react';
import styles from './CategoryCard.module.css';

const CategoryCard = ({ name, imageUrl }) => {
  return (
    <div className={styles.card} style={{ backgroundImage: `url(${imageUrl})` }}>
      <div className={styles.overlay}></div>
      <h3 className={styles.name}>{name}</h3>
    </div>
  );
};

export default CategoryCard;