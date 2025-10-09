import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importe Link e useNavigate
import styles from './Navbar.module.css';
import logoImage from '@/assets/logo-designflix.png';
import { useNavigation } from '../../context/NavigationContext';
import { supabase } from '../../supabaseClient'; // Importe o supabase

// --- Ícones SVG (permanecem os mesmos) ---
const SearchIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 21V19C19 17.9391 18.5786 16.9205 17.8284 16.1703C17.0783 15.4201 16.0609 15 15 15H9C7.93913 15 6.92172 15.4201 6.17157 16.1703C5.42143 16.9205 5 17.9391 5 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 6H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 18H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const Navbar = () => {
    const { searchQuery, setSearchQuery, setIsSearching, isLoggedIn } = useNavigation();
    const navigate = useNavigate(); // 2. Inicialize o hook
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (isSearchVisible) {
            searchInputRef.current.focus();
        } else {
            setSearchQuery('');
            setIsSearching(false);
        }
    }, [isSearchVisible, setSearchQuery, setIsSearching]);
    
    // Função de Logout
    const handleLogout = async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        navigate('/'); // Redireciona para home após o logout
        setIsMobileMenuOpen(false);
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setIsSearching(!!query);
    };
    
    // Fecha o menu mobile ao clicar num link
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className={`${styles.navbarWrapper} ${isMobileMenuOpen ? styles.menuActive : ''}`}>
            <header className={`${styles.navbar} ${isSearchVisible ? styles.searching : ''}`}>
                <div className={styles.leftSection}>
                    {/* 3. A logo agora é um Link */}
                    <Link to={isLoggedIn ? "/dashboard" : "/"} className={`${styles.logo} ${isMobileMenuOpen ? styles.logoCenter : ''}`}>
                        <img src={logoImage} alt="Design Flix Logo" />
                    </Link>
                    <nav className={styles.navLinks}>
                        {/* 3. Links de navegação usam o componente Link */}
                        <Link to="/collections">Collections</Link>
                        <Link to="/pricing">Pricing</Link>
                    </nav>
                </div>

                <div className={styles.rightSection}>
                    {isLoggedIn ? (
                        <>
                            <div className={styles.searchWrapper}>
                                <div className={`${styles.searchInputContainer} ${isSearchVisible ? styles.visible : ''}`}>
                                    <input ref={searchInputRef} type="text" placeholder="Search..." className={styles.searchInput} value={searchQuery} onChange={handleSearchChange} onBlur={() => setIsSearchVisible(false)} />
                                </div>
                                <button onClick={() => setIsSearchVisible(true)} className={`${styles.navButton} ${styles.desktopSearchIcon}`}>
                                    <SearchIcon />
                                </button>
                            </div>
                            
                            <div className={styles.desktopOnly}>
                                <Link to="/profile" className={styles.navButton}><UserIcon /></Link>
                                <a href="#" onClick={handleLogout}>Logout</a>
                            </div>
                            
                            <div className={styles.mobileOnly}>
                                <button onClick={() => setIsSearchVisible(true)} className={styles.navButton}><SearchIcon /></button>
                                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={styles.navButton}><MenuIcon /></button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.profileLink}><Link to="/login">Sign In</Link></div>
                    )}
                </div>
            </header>

            {isLoggedIn && (
                <nav className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.menuOpen : ''}`}>
                    <Link to="/collections" onClick={closeMobileMenu}>Collections</Link>
                    <Link to="/pricing" onClick={closeMobileMenu}>Pricing</Link>
                    <Link to="/profile" onClick={closeMobileMenu}>Profile</Link>
                    <a href="#" onClick={handleLogout} className={styles.logoutLinkMobile}>Logout</a>
                </nav>
            )}

            {isMobileMenuOpen && <div className={styles.pageOverlay}></div>}
        </div>
    );
};

export default Navbar;