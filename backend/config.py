"""
Configuración central de la aplicación backend.

Concentra todas las constantes y variables de entorno para que el
resto del proyecto sea agnóstico a la configuración.
"""
import os

from dotenv import load_dotenv

# Carga variables de entorno desde el archivo .env (si existe)
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def find_file(names, base_dirs):
    """
    Busca un archivo por su nombre en varios directorios base.
    Devuelve la primera ruta existente o None.
    """
    for base in base_dirs:
        if not base:
            continue
        for name in names:
            candidate = os.path.join(base, name)
            if os.path.isfile(candidate):
                return candidate
    return None


class Config:
    """Configuración base de la aplicación."""

    # Directorios donde se busca la cuenta de servicio de Firebase.
    _search_dirs = [
        BASE_DIR,
        os.getcwd(),
    ]

    # Si el archivo real no existe, se usa la plantilla de ejemplo.
    SERVICE_ACCOUNT_PATH = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT",
        find_file(
            ["firebase_service_account.json", "firebase_service_account.example.json"],
            _search_dirs,
        ),
    ) or os.path.join(BASE_DIR, "firebase_service_account.json")

    # Directorio del frontend compilado: se resuelve con resolve_frontend_build().

    # Colecciones de Firestore.
    COLLECTION_CATEGORIES = "categories"
    COLLECTION_COMPONENTS = "components"

    # Categorías que se crean por defecto la primera vez que arranca la app.
    DEFAULT_CATEGORIES = [
        "Capacitores",
        "Resistencias",
        "Circuitos",
        "Transistores",
        "Borneras",
        "Diodos",
    ]

    # Dominios permitidos para CORS (origen del frontend).
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")


def resolve_frontend_build():
    """
    Resuelve la ruta de la carpeta con el frontend compilado.

    1. Variable de entorno FRONTEND_BUILD.
    2. Carpeta 'build' del proyecto (modo desarrollo): ../frontend/build.
    Devuelve None si no hay frontend compilado.
    """
    env = os.getenv("FRONTEND_BUILD")
    if env and os.path.isdir(env):
        return env

    candidate = os.path.join(BASE_DIR, "..", "frontend", "build")
    if os.path.isdir(candidate):
        return candidate

    return None


class DevelopmentConfig(Config):
    """Configuración de desarrollo."""
    DEBUG = True


class ProductionConfig(Config):
    """Configuración de producción."""
    DEBUG = False


def get_config() -> Config:
    """
    Devuelve la configuración según el entorno.

    Por defecto la app corre en modo PRODUCCIÓN (debug apagado). El modo
    desarrollo solo se activa explícitamente con FLASK_ENV=development.
    """
    env = os.getenv("FLASK_ENV", "production")
    if env == "development":
        return DevelopmentConfig()
    return ProductionConfig()
