import React from 'react';
import styles from './MiniPrintCard.module.css';
import { supabase } from '../../supabaseClient'; // 1. Importe o Supabase

const MiniPrintCard = ({ imageUrl, title }) => {
  // 2. Adicionamos a mesma função de otimização aqui também
  const getOptimizedImageUrl = (originalUrl) => {
    if (!originalUrl) return '';

    try {
      const urlObject = new URL(originalUrl);
      const path = urlObject.pathname.split('/products/')[1];

      if (!path) return originalUrl;

      // Para o mini card, podemos pedir uma imagem ainda menor (200px)
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(path, {
          transform: {
            width: 200,
            height: 200,
            resize: 'contain',
          },
        });
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error generating optimized URL for MiniPrintCard:', error);
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
        alt={title}
        className={styles.cardImage}
        onContextMenu={handleRightClick}
      />
    </div>
  );
};

export default MiniPrintCard;