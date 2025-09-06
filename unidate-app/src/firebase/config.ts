import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
