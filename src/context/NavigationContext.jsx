import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const location = useLocation();

  useEffect(() => {
    // A ÚNICA RESPONSABILIDADE DESTE EFEITO É ATUALIZAR O ESTADO DE AUTENTICAÇÃO
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []); // Roda apenas uma vez, para configurar o listener.

  // Efeito para buscar o perfil (sem mudanças)
  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => setProfile(data ?? null));
    } else {
      setProfile(null);
    }
  }, [user]);

  // Efeito para controlar o overlay (sem mudanças)
  useEffect(() => {
    setShowOverlay(location.pathname !== '/payment');
  }, [location.pathname]);

  const isLoggedIn = !!user;

  // O contexto agora é um provedor de estado, não um controlador de navegação.
  const value = {
    searchQuery, setSearchQuery, isSearching, setIsSearching,
    isLoggedIn, showOverlay, user, session, profile,
  };

  return (
    <NavigationContext.Provider value={value}>
      {loading ? (
        <div style={{
          height: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', backgroundColor: '#141414', color: 'white',
          fontSize: '1.5rem', fontFamily: 'sans-serif'
        }}>
          Loading...
        </div>
      ) : (
        children
      )}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  return useContext(NavigationContext);
};