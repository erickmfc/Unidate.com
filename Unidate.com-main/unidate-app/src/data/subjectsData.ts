export interface SubjectData {
  id: string;
  title: string;
  subtitle: string;
  heroContent: string;
  color: string;
  lessons: Array<{
    id: string;
    title: string;
    expertName: string;
    description?: string;
    icon?: string;
  }>;
  tabs: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
  tabContent: Record<string, {
    title: string;
    content: string;
    lessonTitle: string;
    lessonContent: string;
  }>;
  experts: Array<{
    id: string;
    name: string;
    title: string;
    expertise: string[];
    bio: string;
  }>;
}

export const subjectsData: SubjectData[] = [
  {
    id: 'filosofia',
    title: 'Filosofia',
    subtitle: 'A busca pela sabedoria',
    color: 'from-blue-600 to-indigo-600',
    heroContent: 'Eudaimonia é um conceito grego que significa "bem-estar" ou "florescimento humano". É o estado de viver bem e fazer bem, alcançando o potencial máximo como ser humano.',
    lessons: [
      { 
        id: '1', 
        title: 'Introdução à Lógica', 
        expertName: 'Prof. Aristóteles',
        description: 'Explore os fundamentos do raciocínio válido e aprenda a construir argumentos sólidos através da lógica formal e informal.'
      },
      { 
        id: '2', 
        title: 'Epistemologia Moderna', 
        expertName: 'Prof. Descartes',
        description: 'Descubra como o conhecimento é construído e questione os fundamentos do que sabemos através do método cartesiano.'
      },
      { 
        id: '3', 
        title: 'Ética e Moral', 
        expertName: 'Prof. Kant',
        description: 'Reflita sobre o que é certo e errado, explorando diferentes teorias éticas e sua aplicação na vida cotidiana.'
      },
    ],
    tabs: [
      { id: 'logica', label: 'Lógica', icon: '🧠' },
      { id: 'epistemologia', label: 'Epistemologia', icon: '🔬' },
      { id: 'fisica', label: 'Física', icon: '⚛️' },
      { id: 'etica', label: 'Ética', icon: '⚖️' },
      { id: 'paixao', label: 'Paixão', icon: '❤️' },
      { id: 'amor-vida', label: 'Amor & Vida', icon: '💫' },
    ],
    tabContent: {
      logica: {
        title: 'Teoria da Lógica',
        content: 'A lógica é o estudo do raciocínio válido. Ela nos ajuda a distinguir entre argumentos válidos e inválidos, fornecendo ferramentas para pensar de forma clara e precisa.',
        lessonTitle: 'Lógica #1',
        lessonContent: 'Nesta primeira lição, exploraremos os fundamentos da lógica proposicional e como ela se aplica ao pensamento cotidiano.',
      },
      epistemologia: {
        title: 'Teoria do Conhecimento',
        content: 'A epistemologia investiga a natureza, origem e limites do conhecimento humano.',
        lessonTitle: 'Epistemologia #1',
        lessonContent: 'Como sabemos o que sabemos? Esta é a questão central da epistemologia.',
      },
      fisica: {
        title: 'Física e Filosofia',
        content: 'A relação entre física e filosofia explora questões fundamentais sobre a natureza da realidade.',
        lessonTitle: 'Física #1',
        lessonContent: 'Explorando os limites entre ciência e filosofia.',
      },
      etica: {
        title: 'Ética e Moralidade',
        content: 'A ética estuda o que é certo e errado, bom e mau, na conduta humana.',
        lessonTitle: 'Ética #1',
        lessonContent: 'Fundamentos da ética e sua aplicação prática.',
      },
      paixao: {
        title: 'Filosofia da Paixão',
        content: 'A paixão como força motriz do pensamento e da ação humana.',
        lessonTitle: 'Paixão #1',
        lessonContent: 'Entendendo o papel das emoções na filosofia.',
      },
      'amor-vida': {
        title: 'Amor e Vida',
        content: 'Explorando os significados filosóficos do amor e da existência.',
        lessonTitle: 'Amor & Vida #1',
        lessonContent: 'Filosofia do amor e sua relação com a vida plena.',
      },
    },
    experts: [
      {
        id: '1',
        name: 'Prof. Aristóteles',
        title: 'Filósofo Clássico',
        expertise: ['Lógica', 'Ética', 'Metafísica', 'Filosofia Antiga'],
        bio: 'Um dos maiores filósofos da antiguidade, fundador da lógica formal e da ética.',
      },
      {
        id: '2',
        name: 'Prof. René Descartes',
        title: 'Filósofo Moderno',
        expertise: ['Epistemologia', 'Metafísica', 'Matemática', 'Racionalismo'],
        bio: 'Pai da filosofia moderna e do racionalismo. Criador do método cartesiano.',
      },
      {
        id: '3',
        name: 'Prof. Immanuel Kant',
        title: 'Filósofo Iluminista',
        expertise: ['Ética', 'Epistemologia', 'Estética', 'Filosofia Moral'],
        bio: 'Filósofo alemão que revolucionou a ética e a epistemologia.',
      },
    ],
  },
  {
    id: 'matematica',
    title: 'Matemática',
    subtitle: 'A linguagem do universo',
    color: 'from-purple-600 to-pink-600',
    heroContent: 'A matemática é a linguagem com a qual Deus escreveu o universo. Ela nos permite descrever padrões, resolver problemas e compreender a estrutura fundamental da realidade.',
    lessons: [
      { 
        id: '1', 
        title: 'Cálculo Diferencial', 
        expertName: 'Prof. Newton',
        description: 'Domine os conceitos fundamentais de limites, derivadas e suas aplicações práticas em problemas reais de otimização e análise.'
      },
      { 
        id: '2', 
        title: 'Álgebra Linear', 
        expertName: 'Prof. Gauss',
        description: 'Explore sistemas de equações, matrizes, vetores e transformações lineares que formam a base da matemática moderna.'
      },
      { 
        id: '3', 
        title: 'Geometria Analítica', 
        expertName: 'Prof. Descartes',
        description: 'Una álgebra e geometria através de coordenadas, aprendendo a representar formas e resolver problemas espaciais.'
      },
    ],
    tabs: [
      { id: 'calculo', label: 'Cálculo', icon: '📊' },
      { id: 'algebra', label: 'Álgebra', icon: '🔢' },
      { id: 'geometria', label: 'Geometria', icon: '📐' },
      { id: 'estatistica', label: 'Estatística', icon: '📈' },
      { id: 'probabilidade', label: 'Probabilidade', icon: '🎲' },
    ],
    tabContent: {
      calculo: {
        title: 'Fundamentos do Cálculo',
        content: 'O cálculo é uma das ferramentas mais poderosas da matemática, permitindo analisar mudanças e taxas de variação.',
        lessonTitle: 'Cálculo #1',
        lessonContent: 'Introdução aos limites, derivadas e integrais.',
      },
      algebra: {
        title: 'Álgebra Avançada',
        content: 'A álgebra estuda estruturas matemáticas e relações entre quantidades.',
        lessonTitle: 'Álgebra #1',
        lessonContent: 'Sistemas de equações e matrizes.',
      },
      geometria: {
        title: 'Geometria Moderna',
        content: 'A geometria explora formas, espaços e relações espaciais.',
        lessonTitle: 'Geometria #1',
        lessonContent: 'Geometria analítica e coordenadas.',
      },
      estatistica: {
        title: 'Estatística Descritiva',
        content: 'A estatística nos ajuda a entender e interpretar dados.',
        lessonTitle: 'Estatística #1',
        lessonContent: 'Médias, medianas e desvios padrão.',
      },
      probabilidade: {
        title: 'Teoria da Probabilidade',
        content: 'A probabilidade estuda eventos aleatórios e suas chances de ocorrência.',
        lessonTitle: 'Probabilidade #1',
        lessonContent: 'Espaços amostrais e eventos.',
      },
    },
    experts: [
      {
        id: '1',
        name: 'Prof. Isaac Newton',
        title: 'Matemático e Físico',
        expertise: ['Cálculo', 'Física', 'Óptica', 'Mecânica'],
        bio: 'Criador do cálculo infinitesimal e das leis do movimento.',
      },
      {
        id: '2',
        name: 'Prof. Carl Gauss',
        title: 'Príncipe dos Matemáticos',
        expertise: ['Álgebra', 'Teoria dos Números', 'Geometria', 'Estatística'],
        bio: 'Um dos maiores matemáticos de todos os tempos.',
      },
    ],
  },
  {
    id: 'fisica',
    title: 'Física',
    subtitle: 'Compreendendo o universo',
    color: 'from-cyan-600 to-blue-600',
    heroContent: 'A física busca entender os fenômenos naturais e as leis fundamentais que governam o universo, desde as partículas subatômicas até as galáxias distantes.',
    lessons: [
      { 
        id: '1', 
        title: 'Mecânica Clássica', 
        expertName: 'Prof. Newton',
        description: 'Compreenda as leis fundamentais do movimento, forças e energia que governam o mundo macroscópico ao nosso redor.'
      },
      { 
        id: '2', 
        title: 'Eletromagnetismo', 
        expertName: 'Prof. Maxwell',
        description: 'Descubra como eletricidade e magnetismo se unem, formando uma das quatro forças fundamentais da natureza.'
      },
      { 
        id: '3', 
        title: 'Física Quântica', 
        expertName: 'Prof. Einstein',
        description: 'Explore o mundo subatômico onde partículas se comportam como ondas e desafiam nossa intuição clássica.'
      },
    ],
    tabs: [
      { id: 'mecanica', label: 'Mecânica', icon: '⚙️' },
      { id: 'termodinamica', label: 'Termodinâmica', icon: '🌡️' },
      { id: 'eletromagnetismo', label: 'Eletromagnetismo', icon: '⚡' },
      { id: 'quantica', label: 'Quântica', icon: '🔬' },
      { id: 'relatividade', label: 'Relatividade', icon: '🌌' },
    ],
    tabContent: {
      mecanica: {
        title: 'Mecânica Newtoniana',
        content: 'A mecânica clássica descreve o movimento de objetos e as forças que os afetam.',
        lessonTitle: 'Mecânica #1',
        lessonContent: 'Leis de Newton e movimento uniforme.',
      },
      termodinamica: {
        title: 'Termodinâmica',
        content: 'A termodinâmica estuda a relação entre calor, trabalho e energia.',
        lessonTitle: 'Termodinâmica #1',
        lessonContent: 'Leis da termodinâmica e entropia.',
      },
      eletromagnetismo: {
        title: 'Eletromagnetismo',
        content: 'O eletromagnetismo unifica eletricidade e magnetismo em uma única teoria.',
        lessonTitle: 'Eletromagnetismo #1',
        lessonContent: 'Campos elétricos e magnéticos.',
      },
      quantica: {
        title: 'Física Quântica',
        content: 'A física quântica descreve o comportamento da matéria em escala atômica.',
        lessonTitle: 'Quântica #1',
        lessonContent: 'Dualidade onda-partícula e princípio da incerteza.',
      },
      relatividade: {
        title: 'Relatividade',
        content: 'A teoria da relatividade revolucionou nossa compreensão do espaço e tempo.',
        lessonTitle: 'Relatividade #1',
        lessonContent: 'Relatividade especial e dilatação do tempo.',
      },
    },
    experts: [
      {
        id: '1',
        name: 'Prof. Albert Einstein',
        title: 'Físico Teórico',
        expertise: ['Relatividade', 'Física Quântica', 'Cosmologia', 'Teoria de Campos'],
        bio: 'Criador da teoria da relatividade e um dos maiores físicos da história.',
      },
      {
        id: '2',
        name: 'Prof. James Maxwell',
        title: 'Físico e Matemático',
        expertise: ['Eletromagnetismo', 'Óptica', 'Termodinâmica', 'Teoria Cinética'],
        bio: 'Formulou as equações fundamentais do eletromagnetismo.',
      },
    ],
  },
  {
    id: 'quimica',
    title: 'Química',
    subtitle: 'A ciência da matéria',
    color: 'from-green-600 to-emerald-600',
    heroContent: 'A química estuda a composição, estrutura e propriedades da matéria, bem como as transformações que ela sofre durante as reações químicas.',
    lessons: [
      { 
        id: '1', 
        title: 'Química Orgânica', 
        expertName: 'Prof. Lavoisier',
        description: 'Estude os compostos de carbono que formam a base da vida e da maioria dos materiais modernos que usamos.'
      },
      { 
        id: '2', 
        title: 'Química Inorgânica', 
        expertName: 'Prof. Mendeleev',
        description: 'Explore os elementos da tabela periódica e seus compostos, entendendo as propriedades e reatividade.'
      },
      { 
        id: '3', 
        title: 'Físico-Química', 
        expertName: 'Prof. Arrhenius',
        description: 'Una física e química para entender processos moleculares, termodinâmica e cinética de reações.'
      },
    ],
    tabs: [
      { id: 'organica', label: 'Orgânica', icon: '🧪' },
      { id: 'inorganica', label: 'Inorgânica', icon: '⚗️' },
      { id: 'fisico-quimica', label: 'Físico-Química', icon: '🔬' },
      { id: 'analitica', label: 'Analítica', icon: '📊' },
    ],
    tabContent: {
      'organica': {
        title: 'Química Orgânica',
        content: 'A química orgânica estuda os compostos de carbono e suas reações.',
        lessonTitle: 'Orgânica #1',
        lessonContent: 'Estrutura e nomenclatura de compostos orgânicos.',
      },
      'inorganica': {
        title: 'Química Inorgânica',
        content: 'A química inorgânica estuda os elementos e compostos que não contêm carbono.',
        lessonTitle: 'Inorgânica #1',
        lessonContent: 'Tabela periódica e ligações químicas.',
      },
      'fisico-quimica': {
        title: 'Físico-Química',
        content: 'A físico-química combina física e química para entender processos moleculares.',
        lessonTitle: 'Físico-Química #1',
        lessonContent: 'Termodinâmica química e cinética.',
      },
      'analitica': {
        title: 'Química Analítica',
        content: 'A química analítica desenvolve métodos para identificar e quantificar substâncias.',
        lessonTitle: 'Analítica #1',
        lessonContent: 'Técnicas de análise e instrumentação.',
      },
    },
    experts: [
      {
        id: '1',
        name: 'Prof. Antoine Lavoisier',
        title: 'Pai da Química Moderna',
        expertise: ['Química Orgânica', 'Termoquímica', 'Análise Química'],
        bio: 'Fundador da química moderna e criador da lei da conservação da massa.',
      },
      {
        id: '2',
        name: 'Prof. Dmitri Mendeleev',
        title: 'Químico e Inventor',
        expertise: ['Química Inorgânica', 'Tabela Periódica', 'Elementos Químicos'],
        bio: 'Criador da tabela periódica dos elementos.',
      },
    ],
  },
  {
    id: 'biologia',
    title: 'Biologia',
    subtitle: 'A ciência da vida',
    color: 'from-emerald-600 to-teal-600',
    heroContent: 'A biologia estuda todos os aspectos da vida, desde as moléculas até os ecossistemas, buscando compreender os processos que mantêm os organismos vivos.',
    lessons: [
      { 
        id: '1', 
        title: 'Biologia Celular', 
        expertName: 'Prof. Darwin',
        description: 'Descubra a estrutura e função das células, as unidades fundamentais da vida, e como elas trabalham em conjunto para formar organismos complexos.'
      },
      { 
        id: '2', 
        title: 'Genética', 
        expertName: 'Prof. Mendel',
        description: 'Entenda como a informação genética é transmitida através das gerações e como os genes determinam características dos organismos.'
      },
      { 
        id: '3', 
        title: 'Ecologia', 
        expertName: 'Prof. Carson',
        description: 'Explore as interações entre organismos e seu ambiente, compreendendo os ecossistemas, biodiversidade e conservação.'
      },
    ],
    tabs: [
      { id: 'celular', label: 'Celular', icon: '🔬' },
      { id: 'genetica', label: 'Genética', icon: '🧬' },
      { id: 'ecologia', label: 'Ecologia', icon: '🌿' },
      { id: 'anatomia', label: 'Anatomia', icon: '🫀' },
    ],
    tabContent: {
      'celular': {
        title: 'Biologia Celular',
        content: 'A biologia celular estuda a estrutura e função das células, unidades fundamentais da vida.',
        lessonTitle: 'Celular #1',
        lessonContent: 'Estrutura celular e organelas.',
      },
      'genetica': {
        title: 'Genética',
        content: 'A genética estuda a hereditariedade e a variação dos caracteres.',
        lessonTitle: 'Genética #1',
        lessonContent: 'DNA, RNA e síntese proteica.',
      },
      'ecologia': {
        title: 'Ecologia',
        content: 'A ecologia estuda as interações entre organismos e seu ambiente.',
        lessonTitle: 'Ecologia #1',
        lessonContent: 'Ecossistemas e cadeias alimentares.',
      },
      'anatomia': {
        title: 'Anatomia Humana',
        content: 'A anatomia estuda a estrutura do corpo humano e suas partes.',
        lessonTitle: 'Anatomia #1',
        lessonContent: 'Sistemas do corpo humano.',
      },
    },
    experts: [
      {
        id: '1',
        name: 'Prof. Charles Darwin',
        title: 'Naturalista e Biólogo',
        expertise: ['Evolução', 'Ecologia', 'Biologia Marinha'],
        bio: 'Criador da teoria da evolução por seleção natural.',
      },
      {
        id: '2',
        name: 'Prof. Gregor Mendel',
        title: 'Pai da Genética',
        expertise: ['Genética', 'Hereditariedade', 'Genética de Populações'],
        bio: 'Fundador da genética moderna através de seus estudos com ervilhas.',
      },
    ],
  },
  {
    id: 'historia',
    title: 'História',
    subtitle: 'A memória da humanidade',
    color: 'from-amber-600 to-orange-600',
    heroContent: 'A história é o estudo do passado humano, nos permitindo compreender como chegamos ao presente e aprender com as experiências de nossos antepassados.',
    lessons: [
      { 
        id: '1', 
        title: 'História Antiga', 
        expertName: 'Prof. Heródoto',
        description: 'Viaje pelas primeiras civilizações humanas, desde o surgimento da escrita na Mesopotâmia até a queda do Império Romano.'
      },
      { 
        id: '2', 
        title: 'História Medieval', 
        expertName: 'Prof. Gibbon',
        description: 'Explore a Idade Média, período de transformações profundas que moldou a Europa e estabeleceu as bases do mundo ocidental.'
      },
      { 
        id: '3', 
        title: 'História Moderna', 
        expertName: 'Prof. Braudel',
        description: 'Compreenda as grandes revoluções, expansões e transformações que deram origem ao mundo contemporâneo.'
      },
    ],
    tabs: [
      { id: 'antiga', label: 'Antiga', icon: '🏛️' },
      { id: 'medieval', label: 'Medieval', icon: '⚔️' },
      { id: 'moderna', label: 'Moderna', icon: '📜' },
      { id: 'contemporanea', label: 'Contemporânea', icon: '🌍' },
    ],
    tabContent: {
      'antiga': {
        title: 'História Antiga',
        content: 'A história antiga abrange desde o surgimento da escrita até a queda do Império Romano.',
        lessonTitle: 'Antiga #1',
        lessonContent: 'Civilizações mesopotâmicas e egípcias.',
      },
      'medieval': {
        title: 'História Medieval',
        content: 'A Idade Média foi um período de transformações profundas na Europa.',
        lessonTitle: 'Medieval #1',
        lessonContent: 'Feudalismo e sociedade medieval.',
      },
      'moderna': {
        title: 'História Moderna',
        content: 'A Idade Moderna marca o início da expansão europeia e das revoluções.',
        lessonTitle: 'Moderna #1',
        lessonContent: 'Renascimento e grandes navegações.',
      },
      'contemporanea': {
        title: 'História Contemporânea',
        content: 'A história contemporânea estuda os eventos desde a Revolução Francesa até os dias atuais.',
        lessonTitle: 'Contemporânea #1',
        lessonContent: 'Revoluções e transformações do século XX.',
      },
    },
    experts: [
      {
        id: '1',
        name: 'Prof. Heródoto',
        title: 'Pai da História',
        expertise: ['História Antiga', 'Historiografia', 'Cultura Grega'],
        bio: 'Primeiro historiador ocidental, conhecido por suas narrativas sobre as Guerras Persas.',
      },
    ],
  },
  {
    id: 'literatura',
    title: 'Literatura',
    subtitle: 'A arte da palavra',
    color: 'from-rose-600 to-pink-600',
    heroContent: 'A literatura é a arte de expressar ideias, emoções e experiências através da palavra escrita, criando mundos imaginários e refletindo sobre a condição humana.',
    lessons: [
      { 
        id: '1', 
        title: 'Literatura Brasileira', 
        expertName: 'Prof. Machado',
        description: 'Explore a rica tradição literária brasileira, desde o romantismo até a literatura contemporânea, descobrindo vozes que definiram nossa identidade cultural.'
      },
      { 
        id: '2', 
        title: 'Literatura Mundial', 
        expertName: 'Prof. Shakespeare',
        description: 'Descubra obras-primas da literatura universal que transcenderam fronteiras e épocas, conectando diferentes culturas e experiências humanas.'
      },
      { 
        id: '3', 
        title: 'Análise Literária', 
        expertName: 'Prof. Borges',
        description: 'Aprenda técnicas de análise para compreender profundamente textos literários, seus significados, símbolos e contextos históricos.'
      },
    ],
    tabs: [
      { id: 'brasileira', label: 'Brasileira', icon: '📚' },
      { id: 'mundial', label: 'Mundial', icon: '🌎' },
      { id: 'analise', label: 'Análise', icon: '🔍' },
      { id: 'poesia', label: 'Poesia', icon: '✍️' },
    ],
    tabContent: {
      'brasileira': {
        title: 'Literatura Brasileira',
        content: 'A literatura brasileira reflete a diversidade cultural e histórica do Brasil.',
        lessonTitle: 'Brasileira #1',
        lessonContent: 'Romantismo e realismo na literatura brasileira.',
      },
      'mundial': {
        title: 'Literatura Mundial',
        content: 'A literatura mundial nos conecta com diferentes culturas e épocas.',
        lessonTitle: 'Mundial #1',
        lessonContent: 'Grandes obras da literatura universal.',
      },
      'analise': {
        title: 'Análise Literária',
        content: 'A análise literária nos permite compreender profundamente as obras.',
        lessonTitle: 'Análise #1',
        lessonContent: 'Elementos narrativos e figuras de linguagem.',
      },
      'poesia': {
        title: 'Poesia',
        content: 'A poesia é a expressão mais elevada da arte literária.',
        lessonTitle: 'Poesia #1',
        lessonContent: 'Métricas, rimas e recursos poéticos.',
      },
    },
    experts: [
      {
        id: '1',
        name: 'Prof. Machado de Assis',
        title: 'Escritor e Crítico',
        expertise: ['Literatura Brasileira', 'Romance', 'Conto'],
        bio: 'Maior escritor brasileiro, fundador da Academia Brasileira de Letras.',
      },
    ],
  },
];
