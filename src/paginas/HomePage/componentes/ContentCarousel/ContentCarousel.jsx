import React, { useRef } from 'react';
import styles from './ContentCarousel.module.css';
import PrintCard from '../../../../componentes/PrintCard/PrintCard';

// Componente para o ícone da seta (SVG)
const ArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 5L15.5 12L8.5 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ContentCarousel = ({ title, prints }) => {
  // useRef é um "gancho" que nos permite acessar o elemento do carrossel diretamente
  const carouselRef = useRef(null);

  // Função para rolar o carrossel
  const handleScroll = (scrollOffset) => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += scrollOffset;
    }
  };

  return (
    <section className={styles.carouselContainer}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.carouselWrapper}>
        <button
          className={`${styles.navButton} ${styles.left}`}
          onClick={() => handleScroll(-300)} // Rola 300px para a esquerda
        >
          <ArrowIcon />
        </button>

        <div className={styles.carousel} ref={carouselRef}>
          {prints.map((print) => (
            <PrintCard
              key={print.id}
              imageUrl={print.imageUrl}
              title={print.title}
              artist={print.artist}
            />
          ))}
        </div>

        <button
          className={`${styles.navButton} ${styles.right}`}
          onClick={() => handleScroll(300)} // Rola 300px para a direita
        >
          <ArrowIcon />
        </button>
      </div>
    </section>
  );
};

export default ContentCarousel;