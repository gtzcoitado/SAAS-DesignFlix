import React, { useState, useEffect } from 'react';
import Navbar from '../../componentes/Navbar/Navbar';
import Footer from '../../componentes/Footer/Footer';
import ContentCarousel from '../HomePage/componentes/ContentCarousel/ContentCarousel';
import PrintCard from '../../componentes/PrintCard/PrintCard';
import { useNavigation } from '../../context/NavigationContext';
import { supabase } from '../../supabaseClient';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  // 1. ADICIONADO O 'profile' AQUI
  const { user, profile, isSearching, searchQuery } = useNavigation();
  
  // 2. AGORA USAMOS 'profile' PARA PEGAR O NOME
  const userName = profile?.full_name?.split(' ')[0] || "User";

  const [newPrints, setNewPrints] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para formatar os dados vindos do Supabase para o formato do PrintCard
  const formatPrintData = (p) => ({ 
    id: p.id,
    imageUrl: p.image_url, 
    category: p.category 
  });

  useEffect(() => {
    const fetchPrints = async () => {
      setLoading(true);

      const { data: recentData, error: recentError } = await supabase
        .from('products')
        .select('id, image_url, category') // Pega apenas os campos necessários
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentError) console.error('Error fetching new prints:', recentError);
      else setNewPrints(recentData.map(formatPrintData));
      
      const { data: bestsellersData, error: bestsellersError } = await supabase
        .from('products')
        .select('id, image_url, category') // Pega apenas os campos necessários
        .order('download_count', { ascending: false })
        .limit(10);

      if (bestsellersError) console.error('Error fetching bestsellers:', bestsellersError);
      else setBestsellers(bestsellersData.map(formatPrintData));
      
      setLoading(false);
    };

    if (!isSearching) {
        fetchPrints();
    }
  }, [isSearching]);

  useEffect(() => {
    const searchPrints = async () => {
      if (isSearching && searchQuery.length > 0) {
        setLoading(true);
        // Atualiza a busca para procurar apenas na categoria
        const { data, error } = await supabase
          .from('products')
          .select('id, image_url, category')
          .ilike('category', `%${searchQuery}%`);
        
        if (error) console.error('Error searching prints:', error);
        else setSearchResults(data.map(formatPrintData));
        setLoading(false);
      } else if (!searchQuery.length) {
        setSearchResults([]);
      }
    };

    const debounceSearch = setTimeout(() => {
      searchPrints();
    }, 300);

    return () => clearTimeout(debounceSearch);

  }, [searchQuery, isSearching]);

  return (
    <div className={styles.dashboardPage}>
      <Navbar />
      <main className={styles.mainContent}>
        {isSearching ? (
          <section className={styles.resultsSection}>
            <h2>Results for "{searchQuery}"</h2>
            {loading ? <p>Loading...</p> : (
              searchResults.length > 0 ? (
                <div className={styles.searchResultsGrid}>
                  {searchResults.map((print) => (
                    <PrintCard
                      key={print.id}
                      imageUrl={print.imageUrl}
                      category={print.category} // Passa a prop 'category'
                    />
                  ))}
                </div>
              ) : (
                <p>No prints found matching your search.</p>
              )
            )}
          </section>
        ) : (
          <>
            <header className={styles.dashboardHeader}>
              <h1>Welcome back, {userName}!</h1>
              <p>Explore the full catalog of exclusive prints.</p>
            </header>
            {loading ? <p style={{ padding: '0 3rem' }}>Loading content...</p> : (
              <>
                <ContentCarousel title="New This Week" prints={newPrints} />
                <ContentCarousel title="Bestsellers" prints={bestsellers} />
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;