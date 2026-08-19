"""
Rutas de autenticación.

Endpoints:
  - POST /api/auth/login -> Valida el token recibido del frontend.
"""
from flask import Blueprint, jsonify, request

from core.auth import _verify_token
from core.errors import ApiError

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    """
    Recibe el ID token de Firebase (generado por el frontend con la SDK web)
    y devuelve la información del usuario autenticado.

    Cuerpo esperado: {"idToken": "<token>"}
    """
    data = request.get_json(silent=True) or {}
    id_token = data.get("idToken")

    if not id_token:
        raise ApiError("El campo 'idToken' es obligatorio", status_code=422)

    claims = _verify_token(id_token)

    return jsonify(
        {
            "message": "Sesión iniciada correctamente",
            "user": {"uid": claims["uid"], "email": claims.get("email", "")},
        }
    )