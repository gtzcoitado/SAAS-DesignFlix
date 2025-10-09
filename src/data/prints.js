// Dados de exemplo para as várias categorias do catálogo
export const lancamentos = [
    { id: 1, title: 'Samurai Cósmico', artist: 'ArtStation', imageUrl: 'https://images.pexels.com/photos/18285160/pexels-photo-18285160/free-photo-of-preto-e-branco-camiseta-camiseta-impressa-t-shirt-preta.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Sci-Fi' },
    { id: 2, title: 'Gato DJ', artist: 'Studio Meow', imageUrl: 'https://images.pexels.com/photos/18285168/pexels-photo-18285168/free-photo-of-camiseta-camiseta-impressa-t-shirt-preta-gato.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Pop Culture' },
    { id: 3, title: 'Onda Vaporwave', artist: 'Retrowave', imageUrl: 'https://images.pexels.com/photos/7772633/pexels-photo-7772633.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Abstract' },
    { id: 4, title: 'Crânio Floral', artist: 'Inked Design', imageUrl: 'https://images.pexels.com/photos/18314125/pexels-photo-18314125/free-photo-of-camiseta-camiseta-impressa-t-shirt-preta-cranio.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Streetwear' },
    { id: 5, title: 'Frase Motivacional', artist: 'Tipografia BR', imageUrl: 'https://images.pexels.com/photos/7691217/pexels-photo-7691217.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Typography' },
    { id: 11, title: 'Robô Vintage', artist: 'Future Retro', imageUrl: 'https://images.pexels.com/photos/7760361/pexels-photo-7760361.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Geek' },
  ];
  
  export const maisVendidas = [
    { id: 6, title: 'Astronauta Solitário', artist: 'Galaxy Arts', imageUrl: 'https://images.pexels.com/photos/7760368/pexels-photo-7760368.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Sci-Fi' },
    { id: 7, title: 'Leão Geométrico', artist: 'Vetorize', imageUrl: 'https://images.pexels.com/photos/18285183/pexels-photo-18285183/free-photo-of-leao-camiseta-camiseta-impressa-t-shirt-preta.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Geometric' },
    { id: 8, title: 'Controle Clássico', artist: 'Gamer Stuff', imageUrl: 'https://images.pexels.com/photos/13813337/pexels-photo-13813337.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Geek' },
    { id: 9, title: 'Corvo Sombrio', artist: 'Dark Themes', imageUrl: 'https://images.pexels.com/photos/18314133/pexels-photo-18314133/free-photo-of-corvo-preto-e-branco-camiseta-camiseta-impressa.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Streetwear' },
    { id: 10, title: 'Planeta Donut', artist: 'Sweet Universe', imageUrl: 'https://images.pexels.com/photos/18314115/pexels-photo-18314115/free-photo-of-camiseta-camiseta-impressa-t-shirt-preta-planeta.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Pop Culture' },
    { id: 21, title: 'Panda Zen', artist: 'Balance Co.', imageUrl: 'https://images.pexels.com/photos/17992383/pexels-photo-17992383/free-photo-of-preto-e-branco-camiseta-camiseta-impressa-t-shirt-preta.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Minimalist' },
  ];
  
  export const streetwear = [
    { id: 24, title: 'T-Rex Skatista', artist: 'Dino Crew', imageUrl: 'https://images.pexels.com/photos/17992381/pexels-photo-17992381/free-photo-of-preto-e-branco-camiseta-camiseta-impressa-t-shirt-preta.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Streetwear' },
    { id: 19, title: 'Stay Wild', artist: 'Free Soul', imageUrl: 'https://images.pexels.com/photos/18285189/pexels-photo-18285189/free-photo-of-preto-e-branco-camiseta-camiseta-impressa-t-shirt-preta.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Typography' },
    { id: 26, title: 'Good Vibes Only', artist: 'Positivity Prints', imageUrl: 'https://images.pexels.com/photos/7691230/pexels-photo-7691230.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Typography' },
    { id: 30, title: 'Fita K7', artist: '80s Baby', imageUrl: 'https://images.pexels.com/photos/18314088/pexels-photo-18314088/free-photo-of-preto-e-branco-camiseta-camiseta-impressa-t-shirt-preta.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Pop Culture' },
    { id: 14, title: 'Coffee Code', artist: 'DevStyle', imageUrl: 'https://images.pexels.com/photos/547123/pexels-photo-547123.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Geek' },
  ];

const allPrintsData = [...lancamentos, ...maisVendidas, ...streetwear];
// Remove duplicados para ter uma lista mestra limpa
export const allPrints = [...new Map(allPrintsData.map(item => [item['id'], item])).values()];