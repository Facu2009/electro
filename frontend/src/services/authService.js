/**
 * Servicio de autenticación del frontend.
 *
 * Envuelve el SDK de Firebase Authentication. Las credenciales se
 * administran directamente desde Firebase Console, por lo que la app
 * solo se encarga de iniciar y cerrar sesión.
 */
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import app from "../config/firebase";
import { api } from "./api";

export const auth = getAuth(app);

/** Inicia sesión con email y contraseña en Firebase. */
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();

  // Validamos la sesión contra el backend.
  const response = await api.post("/auth/login", { idToken });
  return response.user;
}

/** Cierra la sesión en Firebase. */
export async function logout() {
  await signOut(auth);
}

/** Devuelve el token de sesión vigente (lo usa el cliente HTTP). */
export function getCurrentToken() {
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}
