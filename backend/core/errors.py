"""
Manejadores globales de errores HTTP.

Centraliza el formato de error que devuelve la API para que el
frontend pueda interpretarlo siempre de la misma manera.
"""
from flask import jsonify


class ApiError(Exception):
    """Error de dominio lanzado por los servicios."""

    def __init__(self, message, status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


def register_error_handlers(app):
    """Registra todos los manejadores de error de la API."""

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        payload = {"error": error.message}
        if error.details:
            payload["details"] = error.details
        return jsonify(payload), error.status_code

    @app.errorhandler(404)
    def handle_not_found(_error):
        return jsonify({"error": "Recurso no encontrado"}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(_error):
        return jsonify({"error": "Método no permitido"}), 405

    @app.errorhandler(500)
    def handle_server_error(_error):
        return jsonify({"error": "Error interno del servidor"}), 500
