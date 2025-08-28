
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (firebaseConfigString) {
  const firebaseConfig = JSON.parse(firebaseConfigString);
  // Evita reinicializar o app no Next.js durante o hot-reloading
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.error("Configuração do Firebase não encontrada. Verifique seu arquivo .env.local.");
  // Para evitar que a aplicação quebre completamente, podemos mockar os objetos
  // @ts-ignore
  app = {};
  // @ts-ignore
  auth = {};
  // @ts-ignore
  db = {};
}

export { app, auth, db };
