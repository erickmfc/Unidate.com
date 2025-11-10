// Perguntas de personalidade para o cadastro
export interface PersonalityQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  placeholder?: string;
  category: 'academic' | 'lifestyle' | 'preferences' | 'fun';
}

export const personalityQuestions: PersonalityQuestion[] = [
  // Categoria: Acadêmico
  {
    id: 'study_style',
    question: 'Como você prefere estudar?',
    type: 'single',
    options: ['Na biblioteca', 'Em casa', 'No café', 'Em grupo', 'Sozinho no quarto'],
    category: 'academic'
  },
  {
    id: 'favorite_subject',
    question: 'Qual sua matéria favorita?',
    type: 'text',
    placeholder: 'Ex: Cálculo, História, Programação...',
    category: 'academic'
  },
  {
    id: 'worst_subject',
    question: 'Qual matéria você mais tem dificuldade?',
    type: 'text',
    placeholder: 'Ex: Física, Química, Português...',
    category: 'academic'
  },
  {
    id: 'study_time',
    question: 'Em que horário você estuda melhor?',
    type: 'single',
    options: ['Manhã (6h-12h)', 'Tarde (12h-18h)', 'Noite (18h-24h)', 'Madrugada (0h-6h)'],
    category: 'academic'
  },
  {
    id: 'group_study',
    question: 'Você prefere estudar em grupo ou sozinho?',
    type: 'single',
    options: ['Sempre em grupo', 'Geralmente em grupo', 'Depende da matéria', 'Geralmente sozinho', 'Sempre sozinho'],
    category: 'academic'
  },

  // Categoria: Estilo de Vida
  {
    id: 'campus_food',
    question: 'Qual seu lanche favorito na cantina?',
    type: 'text',
    placeholder: 'Ex: Coxinha, Pastel, Açaí...',
    category: 'lifestyle'
  },
  {
    id: 'campus_spot',
    question: 'Qual seu lugar favorito no campus?',
    type: 'text',
    placeholder: 'Ex: Biblioteca, Praça central, Cantina...',
    category: 'lifestyle'
  },
  {
    id: 'transport',
    question: 'Como você vai para a faculdade?',
    type: 'single',
    options: ['Ônibus', 'Metrô', 'Carro próprio', 'Carona', 'A pé', 'Bicicleta', 'Uber/Taxi'],
    category: 'lifestyle'
  },
  {
    id: 'weekend_activity',
    question: 'O que você faz nos fins de semana?',
    type: 'multiple',
    options: ['Estudar', 'Sair com amigos', 'Ficar em casa', 'Trabalhar', 'Praticar esportes', 'Assistir séries', 'Ler livros'],
    category: 'lifestyle'
  },
  {
    id: 'coffee_preference',
    question: 'Como você toma seu café?',
    type: 'single',
    options: ['Puro', 'Com açúcar', 'Com leite', 'Cappuccino', 'Não bebo café', 'Prefiro chá'],
    category: 'lifestyle'
  },

  // Categoria: Preferências
  {
    id: 'music_genre',
    question: 'Qual seu gênero musical favorito?',
    type: 'single',
    options: ['Pop', 'Rock', 'Sertanejo', 'Funk', 'Rap/Hip-Hop', 'Eletrônica', 'MPB', 'Clássica', 'Indie'],
    category: 'preferences'
  },
  {
    id: 'movie_genre',
    question: 'Qual seu gênero de filme favorito?',
    type: 'single',
    options: ['Ação', 'Comédia', 'Drama', 'Terror', 'Romance', 'Ficção Científica', 'Documentário', 'Animação'],
    category: 'preferences'
  },
  {
    id: 'social_media',
    question: 'Qual rede social você mais usa?',
    type: 'single',
    options: ['Instagram', 'TikTok', 'Twitter', 'Facebook', 'LinkedIn', 'YouTube', 'Snapchat'],
    category: 'preferences'
  },
  {
    id: 'hobby',
    question: 'Qual seu hobby principal?',
    type: 'text',
    placeholder: 'Ex: Jogar futebol, Tocar violão, Desenhar...',
    category: 'preferences'
  },
  {
    id: 'pet',
    question: 'Você tem algum pet?',
    type: 'single',
    options: ['Cachorro', 'Gato', 'Peixe', 'Pássaro', 'Outro', 'Não tenho'],
    category: 'preferences'
  },

  // Categoria: Divertido
  {
    id: 'superpower',
    question: 'Se você pudesse ter um superpoder, qual seria?',
    type: 'single',
    options: ['Voar', 'Invisibilidade', 'Telepatia', 'Super força', 'Teletransporte', 'Controlar o tempo', 'Ler mentes'],
    category: 'fun'
  },
  {
    id: 'dream_job',
    question: 'Qual seu trabalho dos sonhos?',
    type: 'text',
    placeholder: 'Ex: Astronauta, Youtuber, Médico...',
    category: 'fun'
  },
  {
    id: 'fear',
    question: 'Qual seu maior medo na faculdade?',
    type: 'single',
    options: ['Reprovar em uma matéria', 'Não fazer amigos', 'Não conseguir estágio', 'Ficar sem dinheiro', 'Não saber o que fazer depois'],
    category: 'fun'
  },
  {
    id: 'motivation',
    question: 'O que mais te motiva a estudar?',
    type: 'single',
    options: ['Realizar meus sonhos', 'Fazer meus pais orgulhosos', 'Ter uma boa carreira', 'Aprender coisas novas', 'Conhecer pessoas'],
    category: 'fun'
  },
  {
    id: 'fun_fact',
    question: 'Conte algo interessante sobre você:',
    type: 'text',
    placeholder: 'Ex: Já viajei para 10 países, Sei tocar 3 instrumentos...',
    category: 'fun'
  }
];

// Função para obter perguntas por categoria
export const getQuestionsByCategory = (category: 'academic' | 'lifestyle' | 'preferences' | 'fun'): PersonalityQuestion[] => {
  return personalityQuestions.filter(q => q.category === category);
};

// Função para obter perguntas aleatórias
export const getRandomQuestions = (count: number): PersonalityQuestion[] => {
  const shuffled = [...personalityQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
