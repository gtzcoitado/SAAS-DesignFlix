import React from 'react';
import styles from './PrintCard.module.css';
import { supabase } from '../../supabaseClient'; // 1. Importe o Supabase

const PrintCard = ({ imageUrl, category }) => { 
  
  // 2. Adicionamos a mesma função de otimização que usamos no Admin
  const getOptimizedImageUrl = (originalUrl) => {
    if (!originalUrl) return '';

    try {
      const urlObject = new URL(originalUrl);
      const path = urlObject.pathname.split('/products/')[1];

      if (!path) return originalUrl; // Retorna original se o caminho não for encontrado

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(path, {
          transform: {
            width: 400,
            height: 400,
            resize: 'contain',
          },
        });
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error generating optimized URL for PrintCard:', error);
      return originalUrl;
    }
  };

  const thumbnailUrl = getOptimizedImageUrl(imageUrl);

  const handleRightClick = (e) => {
    e.preventDefault();
  };

  return (
    <div className={styles.card}>
      <img
        // 3. Usamos a URL da miniatura otimizada
        src={thumbnailUrl}
        alt={category} 
        className={styles.cardImage}
        onContextMenu={handleRightClick}
      />
    </div>
  );
};

export default PrintCard;