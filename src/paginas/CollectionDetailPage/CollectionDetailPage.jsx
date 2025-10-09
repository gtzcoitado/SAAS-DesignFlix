import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../componentes/Navbar/Navbar';
import Footer from '../../componentes/Footer/Footer';
import PrintCard from '../../componentes/PrintCard/PrintCard';
import MiniPrintCard from '../../componentes/MiniPrintCard/MiniPrintCard';
import Modal from '../../componentes/Modal/Modal';
import LoginRequiredModal from '../../componentes/LoginRequiredModal/LoginRequiredModal';
import SubscriptionRequiredModal from '../../componentes/SubscriptionRequiredModal/SubscriptionRequiredModal';
import { useNavigation } from '../../context/NavigationContext';
import { supabase } from '../../supabaseClient';
import styles from './CollectionDetailPage.module.css';

const CollectionDetailPage = () => {
  const { categoryName } = useParams();
  const { isLoggedIn, user } = useNavigation();
  const [printsOfCategory, setPrintsOfCategory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrint, setCurrentPrint] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    const fetchPrints = async () => {
        if (categoryName) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', categoryName);
            
            if (error) console.error('Error fetching prints:', error);
            else setPrintsOfCategory(data);
        }
    };
    fetchPrints();
  }, [categoryName]);

  const forceDownload = async (print) => {
    try {
      await supabase.rpc('increment_downloads', { product_id_to_update: print.id });
      const response = await fetch(print.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // ALTERAÇÃO AQUI: Mudei a extensão do ficheiro de .jpg para .png
      link.setAttribute('download', `DesignFlix_${print.category}_${print.id.substring(0, 8)}.png`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Could not download the image. Please try again.');
    }
  };

  const handleCardClick = async (print) => {
    if (!isLoggedIn || !user) {
      setIsLoginModalOpen(true);
      return;
    }
    
    const { data: latestProfile, error } = await supabase
      .from('profiles')
      .select('is_subscribed')
      .eq('id', user.id)
      .single();

    if (error || !latestProfile?.is_subscribed) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    
    setCurrentPrint(print);
    setIsModalOpen(true);
  };

  const handleDownloadClick = (print) => {
    forceDownload(print);
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {currentPrint && (
          <div className={styles.modalContent}>
            <img 
              src={currentPrint.image_url} 
              alt={currentPrint.category} 
              className={styles.modalImage}
            />
            <h3>{currentPrint.category}</h3>
            <p>ID: {currentPrint.id}</p>
            <button
              onClick={() => handleDownloadClick(currentPrint)}
              className={styles.downloadButton}
            >
              Download
            </button>
          </div>
        )}
      </Modal>

      <LoginRequiredModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      <SubscriptionRequiredModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      <div className={styles.detailPage}>
        <Navbar />
        <main className={styles.mainContent}>
            <header className={styles.pageHeader}>
                {/* O div agora contém APENAS o título e o parágrafo */}
                <div className={styles.headerContent}>
                    <h1>{categoryName}</h1>
                    <p>Explore all prints in the {categoryName} collection.</p>
                </div>

                {/* O BOTÃO FOI MOVIDO PARA FORA, como um "irmão" do div acima */}
                <Link to="/collections" className={styles.backButton}>
                    <span>Collections</span>
                    <svg width="24" height="24" viewBox="0 a 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </Link>
            </header>

            <div className={styles.printsGrid}>
            {printsOfCategory.map(print => (
                <div 
                key={print.id} 
                className={`${styles.cardWrapper}`}
                onClick={() => handleCardClick(print)}
                >
                    <div className={styles.desktopView}>
                        <PrintCard
                        imageUrl={print.image_url}
                        category={print.category}
                        />
                    </div>
                    <div className={styles.mobileView}>
                        <MiniPrintCard
                        imageUrl={print.image_url}
                        />
                    </div>
                </div>
            ))}
            </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CollectionDetailPage;