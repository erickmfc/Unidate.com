import { db } from '../firebase/config';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Expert } from '../types/subjects';

/**
 * Dados básicos de especialistas para popular o Firebase
 */
export const defaultExperts: Omit<Expert, 'id' | 'createdAt'>[] = [
  {
    name: 'Prof. Aristóteles',
    avatar: '',
    bio: 'Um dos maiores filósofos da antiguidade, fundador da lógica formal e da ética. Discípulo de Platão e professor de Alexandre, o Grande.',
    credentials: [
      'Doutor em Filosofia pela Academia de Atenas',
      'Fundador da Lógica Formal',
      'Autor de "Ética a Nicômaco" e "Metafísica"'
    ],
    specialties: ['Filosofia Clássica', 'Lógica', 'Ética', 'Metafísica'],
    subjects: ['filosofia'],
    rating: 4.9,
    totalRatings: 1250,
    isFavorite: false,
    contactMethods: [
      { type: 'email', value: 'aristoteles@unidate.com', isPublic: true },
      { type: 'chat', value: 'chat_aristoteles', isPublic: true }
    ],
    availability: {
      timezone: 'America/Sao_Paulo',
      schedule: [
        { day: 'Segunda', startTime: '09:00', endTime: '12:00' },
        { day: 'Quarta', startTime: '14:00', endTime: '17:00' },
        { day: 'Sexta', startTime: '10:00', endTime: '13:00' }
      ],
      isAvailable: true
    },
    mentorshipSessions: []
  },
  {
    name: 'Prof. René Descartes',
    avatar: '',
    bio: 'Pai da filosofia moderna e do racionalismo. Criador do método cartesiano e da famosa frase "Penso, logo existo".',
    credentials: [
      'Doutor em Filosofia pela Universidade de Poitiers',
      'Fundador do Racionalismo Moderno',
      'Autor de "Discurso do Método" e "Meditações Metafísicas"'
    ],
    specialties: ['Epistemologia', 'Metafísica', 'Filosofia da Mente', 'Matemática'],
    subjects: ['filosofia'],
    rating: 4.8,
    totalRatings: 980,
    isFavorite: false,
    contactMethods: [
      { type: 'email', value: 'descartes@unidate.com', isPublic: true },
      { type: 'chat', value: 'chat_descartes', isPublic: true }
    ],
    availability: {
      timezone: 'America/Sao_Paulo',
      schedule: [
        { day: 'Terça', startTime: '10:00', endTime: '13:00' },
        { day: 'Quinta', startTime: '15:00', endTime: '18:00' }
      ],
      isAvailable: true
    },
    mentorshipSessions: []
  },
  {
    name: 'Prof. Immanuel Kant',
    avatar: '',
    bio: 'Filósofo alemão que revolucionou a ética e a epistemologia. Criador do idealismo transcendental e da ética deontológica.',
    credentials: [
      'Doutor em Filosofia pela Universidade de Königsberg',
      'Fundador do Idealismo Transcendental',
      'Autor de "Crítica da Razão Pura" e "Fundamentação da Metafísica dos Costumes"'
    ],
    specialties: ['Ética', 'Epistemologia', 'Estética', 'Filosofia Moral'],
    subjects: ['filosofia'],
    rating: 4.9,
    totalRatings: 1100,
    isFavorite: false,
    contactMethods: [
      { type: 'email', value: 'kant@unidate.com', isPublic: true },
      { type: 'chat', value: 'chat_kant', isPublic: true }
    ],
    availability: {
      timezone: 'America/Sao_Paulo',
      schedule: [
        { day: 'Segunda', startTime: '14:00', endTime: '17:00' },
        { day: 'Quarta', startTime: '09:00', endTime: '12:00' },
        { day: 'Sexta', startTime: '15:00', endTime: '18:00' }
      ],
      isAvailable: true
    },
    mentorshipSessions: []
  },
  {
    name: 'Prof. Sócrates',
    avatar: '',
    bio: 'Filósofo grego clássico conhecido pelo método socrático e pela busca da verdade através do questionamento constante.',
    credentials: [
      'Mestre em Filosofia pela Academia de Atenas',
      'Criador do Método Socrático',
      'Mentor de Platão'
    ],
    specialties: ['Ética', 'Epistemologia', 'Filosofia Antiga', 'Método Socrático'],
    subjects: ['filosofia'],
    rating: 5.0,
    totalRatings: 850,
    isFavorite: false,
    contactMethods: [
      { type: 'email', value: 'socrates@unidate.com', isPublic: true },
      { type: 'chat', value: 'chat_socrates', isPublic: true }
    ],
    availability: {
      timezone: 'America/Sao_Paulo',
      schedule: [
        { day: 'Terça', startTime: '08:00', endTime: '11:00' },
        { day: 'Quinta', startTime: '13:00', endTime: '16:00' }
      ],
      isAvailable: true
    },
    mentorshipSessions: []
  },
  {
    name: 'Prof. Friedrich Nietzsche',
    avatar: '',
    bio: 'Filósofo alemão conhecido por suas críticas à moral tradicional e por conceitos como "super-homem" e "vontade de poder".',
    credentials: [
      'Doutor em Filosofia pela Universidade de Leipzig',
      'Filósofo da Existência',
      'Autor de "Assim Falou Zaratustra" e "Além do Bem e do Mal"'
    ],
    specialties: ['Filosofia Existencial', 'Ética', 'Estética', 'Filosofia da Cultura'],
    subjects: ['filosofia'],
    rating: 4.7,
    totalRatings: 920,
    isFavorite: false,
    contactMethods: [
      { type: 'email', value: 'nietzsche@unidate.com', isPublic: true },
      { type: 'chat', value: 'chat_nietzsche', isPublic: true }
    ],
    availability: {
      timezone: 'America/Sao_Paulo',
      schedule: [
        { day: 'Segunda', startTime: '16:00', endTime: '19:00' },
        { day: 'Quarta', startTime: '10:00', endTime: '13:00' }
      ],
      isAvailable: true
    },
    mentorshipSessions: []
  },
  {
    name: 'Prof. Platão',
    avatar: '',
    bio: 'Discípulo de Sócrates e fundador da Academia de Atenas. Criador da teoria das ideias e um dos pilares da filosofia ocidental.',
    credentials: [
      'Fundador da Academia de Atenas',
      'Discípulo de Sócrates',
      'Autor de "A República" e "O Banquete"'
    ],
    specialties: ['Metafísica', 'Ética', 'Política', 'Teoria das Ideias'],
    subjects: ['filosofia'],
    rating: 4.9,
    totalRatings: 1050,
    isFavorite: false,
    contactMethods: [
      { type: 'email', value: 'platao@unidate.com', isPublic: true },
      { type: 'chat', value: 'chat_platao', isPublic: true }
    ],
    availability: {
      timezone: 'America/Sao_Paulo',
      schedule: [
        { day: 'Terça', startTime: '14:00', endTime: '17:00' },
        { day: 'Quinta', startTime: '09:00', endTime: '12:00' },
        { day: 'Sábado', startTime: '10:00', endTime: '13:00' }
      ],
      isAvailable: true
    },
    mentorshipSessions: []
  }
];

/**
 * Função para popular o Firebase com especialistas básicos
 */
export async function bootstrapExperts(): Promise<void> {
  try {
    if (!db) {
      console.error('❌ Firebase não inicializado');
      return;
    }

    console.log('🚀 Iniciando bootstrap de especialistas...');

    const expertsRef = collection(db, 'experts');
    
    for (const expert of defaultExperts) {
      // Criar ID baseado no nome
      const expertId = expert.name.toLowerCase()
        .replace(/prof\.\s*/g, '')
        .replace(/\s+/g, '_')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      const expertDoc = doc(expertsRef, expertId);
      
      // Verificar se já existe
      const existingDoc = await getDoc(expertDoc);
      
      if (!existingDoc.exists()) {
        try {
          await setDoc(expertDoc, {
            ...expert,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          
          console.log(`✅ Especialista criado: ${expert.name} (ID: ${expertId})`);
        } catch (error) {
          console.error(`❌ Erro ao criar especialista ${expert.name}:`, error);
        }
      } else {
        console.log(`⏭️  Especialista já existe: ${expert.name} (ID: ${expertId})`);
      }
    }

    console.log('✅ Bootstrap de especialistas concluído!');
  } catch (error) {
    console.error('❌ Erro no bootstrap de especialistas:', error);
    throw error;
  }
}

/**
 * Função para executar o bootstrap (pode ser chamada manualmente no console)
 */
export function runBootstrap(): void {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Adicionar ao window para acesso via console
    window.bootstrapExperts = bootstrapExperts;
    console.log('💡 Para popular especialistas, execute: await bootstrapExperts()');
  }
}

