"""
Punto de entrada del backend.

Arranca la aplicación Flask, inicializa Firebase (Firestore + Auth),
registra los blueprints, los manejadores de errores, crea las categorías
iniciales la primera vez que se ejecuta y, si existe un frontend
compilado, lo sirve como aplicación de una sola página (SPA).

De esta forma un solo proceso sirve la API y la interfaz en :5000.
"""
import logging
import os

from flask import Flask, abort, send_from_directory

from config import get_config, resolve_frontend_build
from core.db import init_firebase
from core.errors import register_error_handlers as register_api_errors
from core.auth import register_error_handlers as register_auth_errors
from routes import register_api

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    """Fábrica de la aplicación Flask."""
    config = get_config()

    # Si hay frontend compilado, Flask sirve sus assets (/static/...) desde ahí.
    frontend_build = resolve_frontend_build()
    static_options = {"static_folder": frontend_build} if frontend_build else {}

    app = Flask(__name__, **static_options)
    app.config.from_object(config)

    # CORS para permitir peticiones del frontend (útil en desarrollo).
    from flask_cors import CORS

    CORS(app, origins=config.CORS_ORIGINS)

    # Inicialización de Firebase.
    try:
        init_firebase()
        logger.info("Firebase conectado correctamente.")
    except FileNotFoundError as exc:
        logger.error("Firebase no inicializado: %s", exc)

    # Registro de blueprints y manejadores de error.
    register_api(app)
    register_api_errors(app)
    register_auth_errors(app)

    # Endpoint de salud para verificar que el backend responde.
    @app.route("/api/health", methods=["GET"])
    def health():
        return {"status": "ok"}

    # Si hay frontend compilado, se sirve como SPA (rutas amigables).
    if frontend_build:
        logger.info("Sirviendo frontend compilado desde: %s", frontend_build)

        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_spa(path):
            # Las rutas de la API se manejan aparte; todo lo demás es frontend.
            if path.startswith("api/"):
                abort(404)

            target = os.path.join(frontend_build, path)
            if path and os.path.isfile(target):
                return send_from_directory(frontend_build, path)

            # Cualquier ruta del SPA devuelve index.html (React Router lo resuelve).
            return send_from_directory(frontend_build, "index.html")

    return app


def seed_default_categories():
    """Crea las categorías iniciales si la colección está vacía."""
    from config import Config
    from core.db import get_db

    db = get_db()
    ref = db.collection(Config.COLLECTION_CATEGORIES)

    if ref.limit(1).get():
        logger.info("Las categorías ya existen. Omitiendo seed.")
        return

    logger.info("Creando categorías iniciales: %s", Config.DEFAULT_CATEGORIES)
    for name in Config.DEFAULT_CATEGORIES:
        ref.add({"name": name})


app = create_app()


def _run_server():
    """
    Inicia el servidor.

    - Producción: usa waitress (WSGI de producción), sin debug ni reloader.
    - Desarrollo (FLASK_ENV=development): usa el servidor de Flask con debug.
    """
    seed_default_categories()

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))

    is_dev = app.config["DEBUG"]
    if is_dev:
        app.run(host=host, port=port, debug=True, use_reloader=True)
        return

    try:
        from waitress import serve

        logger.info("Servidor de producción iniciado en http://%s:%s", host, port)
        serve(app, host=host, port=port)
    except ImportError:
        logger.warning(
            "waitress no está instalado; usando el servidor de desarrollo de Flask "
            "(no apto para producción). Instalalo con: pip install waitress"
        )
        app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    _run_server()
