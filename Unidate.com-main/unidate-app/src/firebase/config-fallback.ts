import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDYIK8EHJMz6r3vJSJE6U0fn7FEhI3btFc",
  authDomain: "unidate-2bcbc.firebaseapp.com",
  projectId: "unidate-2bcbc",
  storageBucket: "unidate-2bcbc.firebasestorage.app",
  messagingSenderId: "717555700125",
  appId: "1:717555700125:web:f985cbba177cff29ab9f74",
  measurementId: "G-21PEDSXMXQ"
};

let app;
let auth;
let db;
let storage;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  analytics = getAnalytics(app);
  
  console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  console.log('🔄 Usando modo de desenvolvimento local...');
  
  app = null;
  auth = null;
  db = null;
  storage = null;
  analytics = null;
}

export { auth, db, storage, analytics };
export default app;
