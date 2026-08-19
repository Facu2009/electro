"""
Servicio de componentes.

Encapsula las operaciones CRUD sobre la colección 'components' de
Firestore, además de las operaciones rápidas de stock y precio.
"""
from google.cloud.firestore import Query

from config import Config
from core.db import get_db
from core.errors import ApiError
from models.component import ComponentModel, validate_component_data

COMPONENTS_COLLECTION = Config.COLLECTION_COMPONENTS
CATEGORIES_COLLECTION = Config.COLLECTION_CATEGORIES


def list_components(category: str = None) -> list:
    """Devuelve todos los componentes, opcionalmente filtrados por categoría."""
    db = get_db()
    query = db.collection(COMPONENTS_COLLECTION).order_by("name", direction=Query.ASCENDING)

    if category:
        query = query.where("category", "==", category)

    refs = query.stream()
    return [ComponentModel.from_dict(doc.to_dict(), doc.id).to_dict() for doc in refs]


def get_component(component_id: str) -> ComponentModel:
    """Devuelve un componente por ID o lanza ApiError si no existe."""
    db = get_db()
    doc = db.collection(COMPONENTS_COLLECTION).document(component_id).get()

    if not doc.exists:
        raise ApiError("Componente no encontrado", status_code=404)

    return ComponentModel.from_dict(doc.to_dict(), doc.id)


def _category_exists(db, category_ref: str) -> bool:
    """Valida que la categoría indicada exista (por ID o por nombre)."""
    for doc in db.collection(CATEGORIES_COLLECTION).stream():
        data = doc.to_dict()
        if doc.id == category_ref or data.get("name") == category_ref:
            return True
    return False


def _validate_category(db, model: ComponentModel) -> None:
    """Verifica que la categoría del componente exista."""
    if not _category_exists(db, model.category):
        raise ApiError(
            f"La categoría '{model.category}' no existe. Crea la categoría antes de asignarla.",
            status_code=422,
        )


def create_component(data: dict) -> ComponentModel:
    """Crea un nuevo componente validando sus datos y su categoría."""
    db = get_db()
    model = validate_component_data(data)
    _validate_category(db, model)

    doc_ref = db.collection(COMPONENTS_COLLECTION).document()
    doc_ref.set(model.to_dict())
    model.id = doc_ref.id
    return model


def update_component(component_id: str, data: dict) -> ComponentModel:
    """Actualiza un componente existente (actualización parcial)."""
    db = get_db()
    existing = get_component(component_id)

    merged = {**existing.to_dict(), **data}
    model = validate_component_data(merged, partial=True)

    # Solo se valida la categoría si fue modificada.
    if "category" in data:
        _validate_category(db, model)

    db.collection(COMPONENTS_COLLECTION).document(component_id).update(model.to_dict())
    return get_component(component_id)


def delete_component(component_id: str) -> None:
    """Elimina un componente."""
    db = get_db()
    get_component(component_id)  # Verifica que exista
    db.collection(COMPONENTS_COLLECTION).document(component_id).delete()


def adjust_stock(component_id: str, data: dict) -> ComponentModel:
    """
    Operación rápida de stock.

    Acepta un delta relativo (p. ej. +5, -3). El stock nunca puede
    quedar por debajo de cero.
    """
    db = get_db()
    component = get_component(component_id)

    delta = data.get("delta")
    if delta is None:
        raise ApiError("El campo 'delta' es obligatorio", status_code=422)
    if not isinstance(delta, (int, float)) or isinstance(delta, bool):
        raise ApiError("El campo 'delta' debe ser un número", status_code=422)
    if delta == 0:
        raise ApiError("El delta no puede ser cero", status_code=422)

    new_stock = component.stock + int(delta)
    if new_stock < 0:
        raise ApiError(
            "Stock insuficiente: la cantidad resultante no puede ser negativa",
            status_code=422,
        )

    db.collection(COMPONENTS_COLLECTION).document(component_id).update({"stock": new_stock})
    return get_component(component_id)


def update_price(component_id: str, data: dict) -> ComponentModel:
    """Operación rápida para actualizar el precio de un componente."""
    db = get_db()
    get_component(component_id)  # Verifica que exista

    price = data.get("price")
    if price is None:
        raise ApiError("El campo 'price' es obligatorio", status_code=422)
    if isinstance(price, bool) or not isinstance(price, (int, float)):
        raise ApiError("El precio debe ser un número", status_code=422)
    if price <= 0:
        raise ApiError("El precio debe ser mayor que cero", status_code=422)

    db.collection(COMPONENTS_COLLECTION).document(component_id).update(
        {"price": float(price)}
    )
    return get_component(component_id)
