import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// 1. IMPORTAMOS O NOVO COMPONENTE AQUI
import ScrollToTop from './componentes/ScrollToTop/ScrollToTop';

import HomePage from './paginas/HomePage/HomePage';
import LoginPage from './paginas/LoginPage/LoginPage';
import SignUpPage from './paginas/SignUpPage/SignUpPage';
import DashboardPage from './paginas/DashboardPage/DashboardPage';
import CollectionsPage from './paginas/CollectionsPage/CollectionsPage';
import CollectionDetailPage from './paginas/CollectionDetailPage/CollectionDetailPage';
import PricingPage from './paginas/PricingPage/PricingPage';
import ProfilePage from './paginas/ProfilePage/ProfilePage';
import PaymentPage from './paginas/PaymentPage/PaymentPage';

import './App.css';
import { useNavigation } from './context/NavigationContext';

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1.0] 
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  }
};

const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    {children}
  </motion.div>
);

function App() {
  const { showOverlay } = useNavigation();
  const location = useLocation();

  return (
    <div className="app-container">
      {showOverlay && <div className="app-overlay"></div>}
      
      {/* 2. ADICIONAMOS O COMPONENTE AQUI */}
      <ScrollToTop />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="/signup" element={<PageWrapper><SignUpPage /></PageWrapper>} />
          <Route path="/dashboard" element={<PageWrapper><DashboardPage /></PageWrapper>} />
          <Route path="/collections" element={<PageWrapper><CollectionsPage /></PageWrapper>} />
          <Route path="/collection/:categoryName" element={<PageWrapper><CollectionDetailPage /></PageWrapper>} />
          <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
          <Route path="/payment" element={<PageWrapper><PaymentPage /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;