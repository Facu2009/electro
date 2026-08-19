"""
Manejo de autenticación del lado del servidor.

Verifica el token JWT (ID token) que envía el frontend tras iniciar
sesión con Firebase Authentication. Cualquier usuario registrado en
Firebase puede acceder a los endpoints.
"""
import functools

from flask import g, jsonify, request

from core.db import get_auth


class AuthError(Exception):
    """Excepción personalizada para errores de autenticación."""

    def __init__(self, message, status_code=401):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


# Tolerancia de desfase de reloj (segundos) al verificar tokens.
# Evita errores de "Token used too early/late" por pequeñas diferencias
# entre el reloj local de la computadora y el de Firebase/Google.
CLOCK_SKEW_SECONDS = 60


def _verify_token(token: str) -> dict:
    """
    Verifica un ID token de Firebase y devuelve las claims del usuario.

    Lanza AuthError si el token no es válido o ha expirado.
    """
    try:
        return get_auth().verify_id_token(
            token, clock_skew_seconds=CLOCK_SKEW_SECONDS
        )
    except Exception as exc:  # firebase_admin.auth.InvalidIdTokenError, ExpiredIdTokenError, etc.
        raise AuthError(f"Token de sesión inválido o expirado: {exc}") from exc


def require_auth(func):
    """
    Decorador que protege los endpoints.

    Espera el token en la cabecera 'Authorization: Bearer <token>' y
    verifica que pertenezca a un usuario registrado en Firebase.
    Cualquier usuario autenticado tiene acceso.
    """

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise AuthError("Falta la cabecera de autorización")

        token = auth_header.split(" ", 1)[1]
        claims = _verify_token(token)

        # Guardamos el UID y email del usuario autenticado en el contexto.
        g.user_uid = claims["uid"]
        g.user_email = claims.get("email")

        return func(*args, **kwargs)

    return wrapper


def register_error_handlers(app):
    """Registra el manejador de errores de autenticación en la app Flask."""

    @app.errorhandler(AuthError)
    def handle_auth_error(error):
        return jsonify({"error": error.message}), error.status_code
