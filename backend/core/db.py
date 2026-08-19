"""
Inicialización de Firebase (Firestore + Auth) usando el SDK firebase-admin.

Las credenciales pueden venir de dos lugares:
  1. Variable de entorno FIREBASE_SERVICE_ACCOUNT_JSON (ideal para la nube:
     Cloud Run / Render / Railway) con el contenido del JSON de la cuenta
     de servicio, en texto plano o codificado en base64 (con prefijo "base64:").
  2. Archivo firebase_service_account.json (modo local, en backend/).
"""
import base64
import json
import logging
import os

import firebase_admin
from firebase_admin import credentials, firestore

from config import Config

logger = logging.getLogger(__name__)

_firebase_app = None
_db = None


def _decode_credentials(value: str) -> dict:
    """Interpreta el contenido del JSON de la cuenta de servicio."""
    # Si viene con prefijo base64, se decodifica.
    if value.startswith("base64:"):
        raw = base64.b64decode(value[len("base64:") :])
        value = raw.decode("utf-8")

    # Si ya parece JSON, se parsea directo.
    if value.lstrip().startswith("{"):
        return json.loads(value)

    # Último intento: base64 plano.
    try:
        raw = base64.b64decode(value.encode("utf-8"), validate=True)
        return json.loads(raw.decode("utf-8"))
    except Exception as exc:
        raise ValueError(
            "FIREBASE_SERVICE_ACCOUNT_JSON no es un JSON válido ni base64"
        ) from exc


def _load_credentials():
    """
    Resuelve las credenciales de Firebase.

    Prioridad:
      1. Variable de entorno FIREBASE_SERVICE_ACCOUNT_JSON (contenido JSON).
      2. Archivo resuelto por Config (busca junto al .exe, en la carpeta
         empaquetada y en el proyecto).
      3. Plantilla de ejemplo (solo para desarrollo local).
    """
    env_credentials = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if env_credentials:
        return credentials.Certificate(_decode_credentials(env_credentials))

    path = Config.SERVICE_ACCOUNT_PATH

    # La plantilla de ejemplo ya fue elegida por Config si no hay credenciales.
    if os.path.exists(path):
        return credentials.Certificate(path)

    example_path = os.path.join(
        os.path.dirname(path), "firebase_service_account.example.json"
    )
    if os.path.exists(example_path):
        logger.warning(
            "No se encontraron credenciales reales. Usando la plantilla de ejemplo %s. "
            "En la nube usa la variable FIREBASE_SERVICE_ACCOUNT_JSON o coloca el "
            "archivo 'firebase_service_account.json' en la carpeta backend/.",
            example_path,
        )
        return credentials.Certificate(example_path)

    raise FileNotFoundError(
        "No se encontraron las credenciales de Firebase. "
        "En cloud define la variable FIREBASE_SERVICE_ACCOUNT_JSON con el contenido "
        f"del JSON de la cuenta de servicio, o coloca el archivo en: {path}"
    )


def init_firebase():
    """Inicializa la app de Firebase y devuelve el cliente de Firestore."""
    global _firebase_app, _db

    if _firebase_app is not None:
        return _db

    cred = _load_credentials()
    _firebase_app = firebase_admin.initialize_app(cred)
    _db = firestore.client(_firebase_app)

    logger.info("Firebase inicializado correctamente (proyecto: %s)", _firebase_app.project_id)
    return _db


def get_db():
    """Devuelve el cliente de Firestore, inicializándolo si es necesario."""
    if _db is None:
        return init_firebase()
    return _db


def get_auth():
    """Devuelve el cliente de Firebase Auth."""
    if _firebase_app is None:
        init_firebase()
    from firebase_admin import auth

    return auth
