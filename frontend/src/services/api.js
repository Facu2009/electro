/**
 * Cliente HTTP del frontend.
 *
 * Centraliza el acceso a la API del backend: inyecta automáticamente el
 * token de Firebase en la cabecera Authorization y normaliza los errores
 * para que el resto de la aplicación los maneje fácilmente.
 */
import { auth } from "./authService";

// Base de la API. Si no se define REACT_APP_API_URL se usan rutas relativas
// (/api/...), lo que permite que el frontend compilado lo sirva el propio
// backend (modo producción local) sin necesidad de configurar una URL fija.
const API_URL = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

/** Recupera el token de sesión actual o lanza error si no hay sesión. */
async function getToken() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new ApiError("No hay una sesión activa", 401);
  }
  return currentUser.getIdToken();
}

/** Error normalizado de la API con su código y mensaje. */
export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Realiza una petición autenticada al backend.
 *
 * @param {string} path      Ruta relativa al API (ej. "/components").
 * @param {object} options   Opciones de fetch (method, body, etc.).
 */
async function request(path, options = {}) {
  const token = await getToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // Respuesta sin cuerpo JSON; se ignora.
  }

  if (!response.ok) {
    throw new ApiError(
      payload.error || "Error inesperado en el servidor",
      response.status,
      payload.details
    );
  }

  return payload;
}

export const api = {
  /** GET a una ruta de la API. */
  get: (path) => request(path, { method: "GET" }),

  /** POST a una ruta de la API. */
  post: (path, body) => request(path, { method: "POST", body }),

  /** PUT a una ruta de la API. */
  put: (path, body) => request(path, { method: "PUT", body }),

  /** PATCH a una ruta de la API. */
  patch: (path, body) => request(path, { method: "PATCH", body }),

  /** DELETE a una ruta de la API. */
  delete: (path) => request(path, { method: "DELETE" }),
};
