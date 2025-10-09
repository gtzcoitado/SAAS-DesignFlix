import React, { useState, useEffect } from 'react';
import Navbar from '../../componentes/Navbar/Navbar';
import HeroSection from './componentes/HeroSection/HeroSection';
import ContentCarousel from './componentes/ContentCarousel/ContentCarousel';
import Footer from '../../componentes/Footer/Footer';
import { supabase } from '../../supabaseClient'; // 1. Importamos o Supabase
import styles from './HomePage.module.css';

const HomePage = () => {
  // 2. Criamos estados para armazenar os dados e o status de carregamento
  const [newPrints, setNewPrints] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. Usamos o useEffect para buscar os dados assim que a página carregar
  useEffect(() => {
    const fetchPrints = async () => {
      setLoading(true);

      // Busca os 10 lançamentos mais recentes
      const { data: recentData, error: recentError } = await supabase
        .from('products')
        .select('id, image_url, category')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentError) console.error('Error fetching new prints:', recentError);
      else {
        // Formatamos os dados para o formato que o componente PrintCard espera
        const formattedData = recentData.map(p => ({ id: p.id, imageUrl: p.image_url, category: p.category }));
        setNewPrints(formattedData);
      }
      
      // Busca os 10 mais vendidos (maior contagem de downloads)
      const { data: bestsellersData, error: bestsellersError } = await supabase
        .from('products')
        .select('id, image_url, category')
        .order('download_count', { ascending: false })
        .limit(10);

      if (bestsellersError) console.error('Error fetching bestsellers:', bestsellersError);
      else {
        const formattedData = bestsellersData.map(p => ({ id: p.id, imageUrl: p.image_url, category: p.category }));
        setBestsellers(formattedData);
      }
      
      setLoading(false);
    };

    fetchPrints();
  }, []); // O array vazio [] garante que a busca só aconteça uma vez

  return (
    <div className={styles.homePage}>
      <Navbar />
      <main>
        <HeroSection />
        {/* 4. Adicionamos uma verificação de 'loading' para melhor experiência */}
        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', padding: '2rem' }}>
            Loading prints...
          </p>
        ) : (
          <>
            {/* 5. Passamos os dados dinâmicos para os carrosséis */}
            <ContentCarousel title="New This Week" prints={newPrints} />
            <ContentCarousel title="Bestsellers" prints={bestsellers} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;