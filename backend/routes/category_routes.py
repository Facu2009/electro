"""
Rutas CRUD de categorías.

Endpoints (todos requieren sesión iniciada):
  - GET    /api/categories           -> Listar categorías
  - POST   /api/categories           -> Crear categoría
  - PUT    /api/categories/<id>      -> Actualizar categoría
  - DELETE /api/categories/<id>      -> Eliminar categoría
"""
from flask import Blueprint, jsonify, request

from core.auth import require_auth
from services import category_service

category_bp = Blueprint("categories", __name__)


@category_bp.route("/categories", methods=["GET"])
@require_auth
def get_categories():
    """Devuelve el listado completo de categorías."""
    categories = category_service.list_categories()
    return jsonify({"categories": categories})


@category_bp.route("/categories", methods=["POST"])
@require_auth
def create_category():
    """Crea una nueva categoría."""
    data = request.get_json(silent=True) or {}
    category = category_service.create_category(data)
    return jsonify({"category": category.to_dict()}), 201


@category_bp.route("/categories/<category_id>", methods=["PUT"])
@require_auth
def update_category(category_id):
    """Actualiza una categoría existente."""
    data = request.get_json(silent=True) or {}
    category = category_service.update_category(category_id, data)
    return jsonify({"category": category.to_dict()})


@category_bp.route("/categories/<category_id>", methods=["DELETE"])
@require_auth
def delete_category(category_id):
    """Elimina una categoría (bloqueado si está en uso)."""
    category_service.delete_category(category_id)
    return jsonify({"message": "Categoría eliminada correctamente"})
