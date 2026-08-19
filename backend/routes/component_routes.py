"""
Rutas CRUD de componentes y acciones rápidas de stock/precio.

Endpoints (todos requieren sesión iniciada):
  - GET    /api/components                  -> Listar (opcional ?category=)
  - POST   /api/components                  -> Crear componente
  - PUT    /api/components/<id>             -> Actualizar componente
  - DELETE /api/components/<id>             -> Eliminar componente
  - PATCH  /api/components/<id>/stock       -> Ajustar stock (+/- delta)
  - PATCH  /api/components/<id>/price       -> Actualizar precio
"""
from flask import Blueprint, jsonify, request

from core.auth import require_auth
from services import component_service

component_bp = Blueprint("components", __name__)


@component_bp.route("/components", methods=["GET"])
@require_auth
def get_components():
    """Lista los componentes, opcionalmente filtrados por categoría."""
    category = request.args.get("category", "").strip() or None
    components = component_service.list_components(category)
    return jsonify({"components": components})


@component_bp.route("/components", methods=["POST"])
@require_auth
def create_component():
    """Crea un nuevo componente."""
    data = request.get_json(silent=True) or {}
    component = component_service.create_component(data)
    return jsonify({"component": component.to_dict()}), 201


@component_bp.route("/components/<component_id>", methods=["PUT"])
@require_auth
def update_component(component_id):
    """Actualiza un componente existente."""
    data = request.get_json(silent=True) or {}
    component = component_service.update_component(component_id, data)
    return jsonify({"component": component.to_dict()})


@component_bp.route("/components/<component_id>", methods=["DELETE"])
@require_auth
def delete_component(component_id):
    """Elimina un componente."""
    component_service.delete_component(component_id)
    return jsonify({"message": "Componente eliminado correctamente"})


@component_bp.route("/components/<component_id>/stock", methods=["PATCH"])
@require_auth
def adjust_stock(component_id):
    """
    Ajuste rápido de stock.
    Cuerpo esperado: {"delta": 5}  o  {"delta": -3}
    """
    data = request.get_json(silent=True) or {}
    component = component_service.adjust_stock(component_id, data)
    return jsonify({"component": component.to_dict()})


@component_bp.route("/components/<component_id>/price", methods=["PATCH"])
@require_auth
def update_price(component_id):
    """Actualización rápida de precio. Cuerpo esperado: {"price": 12.5}"""
    data = request.get_json(silent=True) or {}
    component = component_service.update_price(component_id, data)
    return jsonify({"component": component.to_dict()})
