import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDYIK8EHJMz6r3vJSJE6U0fn7FEhI3btFc",
  authDomain: "unidate-2bcbc.firebaseapp.com",
  projectId: "unidate-2bcbc",
  storageBucket: "unidate-2bcbc.firebasestorage.app",
  messagingSenderId: "717555700125",
  appId: "1:717555700125:web:f985cbba177cff29ab9f74",
  measurementId: "G-21PEDSXMXQ"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

try {
  // Tentar inicializar Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  analytics = getAnalytics(app);
  
  console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  console.log('🔄 Usando modo de desenvolvimento local...');
  
  // Fallback para desenvolvimento local
  app = null;
  auth = null;
  db = null;
  storage = null;
  analytics = null;
}

export { auth, db, storage, analytics };
export default app;
