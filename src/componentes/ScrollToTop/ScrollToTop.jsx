import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Extrai o 'pathname' (a parte da URL que muda) do objeto de localização
  const { pathname } = useLocation();

  // O useEffect vai rodar toda vez que o 'pathname' mudar
  useEffect(() => {
    // A mágica acontece aqui: isso manda a janela para as coordenadas (0, 0) - o topo da página.
    window.scrollTo(0, 0);
  }, [pathname]); // O array de dependências garante que o efeito só rode quando a URL mudar

  // Este componente não renderiza nada visualmente, ele é apenas funcional.
  return null;
};

export default ScrollToTop;