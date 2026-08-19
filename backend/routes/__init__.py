"""
Agregador de blueprints.

Centraliza el registro de todos los blueprints de la API para que
app.py se mantenga limpio y escalable.
"""
from flask import Blueprint

from routes.auth_routes import auth_bp
from routes.category_routes import category_bp
from routes.component_routes import component_bp

api_bp = Blueprint("api", __name__, url_prefix="/api")

# Registro de sub-blueprints.
api_bp.register_blueprint(auth_bp)
api_bp.register_blueprint(category_bp)
api_bp.register_blueprint(component_bp)


def register_api(app):
    """Registra el blueprint principal de la API en la aplicación."""
    app.register_blueprint(api_bp)
