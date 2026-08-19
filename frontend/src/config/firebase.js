/**
 * Inicialización de Firebase en el frontend.
 *
 * Las credenciales se cargan desde las variables de entorno (archivo .env).
 * Si alguna falta, se muestra una advertencia clara en consola para que el
 * administrador complete la configuración.
 */
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const MISSING_KEYS = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (MISSING_KEYS.length > 0) {
  console.warn(
    `[Firebase] Faltan variables de entorno: ${MISSING_KEYS.join(
      ", "
    )}. Revisa el archivo .env`
  );
}

export const app = initializeApp(firebaseConfig);
export default app;
