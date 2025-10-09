import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importe o hook
import Navbar from '../../componentes/Navbar/Navbar';
import Footer from '../../componentes/Footer/Footer';
import CategoryCard from '../../componentes/CategoryCard/CategoryCard';
import { supabase } from '../../supabaseClient';
import styles from './CollectionsPage.module.css';

const CollectionsPage = () => {
  const navigate = useNavigate(); // 2. Inicialize o hook
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCovers = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_category_covers');

      if (error) {
        console.error('Error fetching category covers:', error);
      } else {
        const formattedData = data.map(item => ({
          id: item.category,
          name: item.category,
          imageUrl: item.image_url
        }));
        setCategories(formattedData);
      }
      setLoading(false);
    };

    fetchCategoryCovers();
  }, []);

  const handleCategoryClick = (categoryName) => {
    // 3. Navega para a URL dinâmica da categoria
    navigate(`/collection/${categoryName}`);
  };

  return (
    <div className={styles.collectionsPage}>
      <Navbar />
      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <h1>Collections</h1>
          <p>Explore prints by browsing our curated categories.</p>
        </header>
        <div className={styles.categoryGrid}>
          {loading ? (
            <p>Loading collections...</p>
          ) : (
            categories.map(category => (
              <div key={category.id} onClick={() => handleCategoryClick(category.name)}>
                <CategoryCard
                  name={category.name}
                  imageUrl={category.imageUrl}
                />
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CollectionsPage;