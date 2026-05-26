import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Analytics } from 'firebase/analytics';

const app: FirebaseApp | null = null;
const auth: Auth | null = null;
const db: Firestore | null = null;
const storage: FirebaseStorage | null = null;
const analytics: Analytics | null = null;

console.log('🔄 UniDate rodando em modo 100% Local (Offline)');

export { auth, db, storage, analytics };
export default app;
