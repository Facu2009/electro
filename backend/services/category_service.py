"""
Servicio de categorías.

Encapsula todas las operaciones CRUD sobre la colección 'categories'
de Firestore, incluyendo la lógica de nombres duplicados y las
restricciones al eliminar categorías en uso.
"""
from google.cloud.firestore import Query

from config import Config
from core.db import get_db
from core.errors import ApiError
from models.category import CategoryModel, validate_category_data

CATEGORIES_COLLECTION = Config.COLLECTION_CATEGORIES
COMPONENTS_COLLECTION = Config.COLLECTION_COMPONENTS


def _normalize(name: str) -> str:
    """Normaliza un nombre para comparaciones sin distinción de mayúsculas."""
    return name.strip().lower()


def list_categories() -> list:
    """Devuelve todas las categorías ordenadas alfabéticamente."""
    db = get_db()
    refs = (
        db.collection(CATEGORIES_COLLECTION)
        .order_by("name", direction=Query.ASCENDING)
        .stream()
    )
    return [CategoryModel.from_dict(doc.to_dict(), doc.id).to_dict() for doc in refs]


def get_category(category_id: str) -> CategoryModel:
    """Devuelve una categoría por ID o lanza ApiError si no existe."""
    db = get_db()
    doc = db.collection(CATEGORIES_COLLECTION).document(category_id).get()

    if not doc.exists:
        raise ApiError("Categoría no encontrada", status_code=404)

    return CategoryModel.from_dict(doc.to_dict(), doc.id)


def _name_in_use(db, name: str, exclude_id: str = None) -> bool:
    """Comprueba si un nombre de categoría ya existe (case-insensitive)."""
    normalized = _normalize(name)
    for doc in db.collection(CATEGORIES_COLLECTION).stream():
        if doc.id == exclude_id:
            continue
        if _normalize(doc.to_dict().get("name", "")) == normalized:
            return True
    return False


def create_category(data: dict) -> CategoryModel:
    """Crea una nueva categoría garantizando que el nombre sea único."""
    db = get_db()
    model = validate_category_data(data)

    if _name_in_use(db, model.name):
        raise ApiError("Ya existe una categoría con ese nombre", status_code=409)

    doc_ref = db.collection(CATEGORIES_COLLECTION).document()
    doc_ref.set(model.to_dict())
    model.id = doc_ref.id
    return model


def update_category(category_id: str, data: dict) -> CategoryModel:
    """Actualiza una categoría existente."""
    db = get_db()
    existing = get_category(category_id)

    merged = {**existing.to_dict(), **data}
    model = validate_category_data(merged, partial=True)

    if _name_in_use(db, model.name, exclude_id=category_id):
        raise ApiError("Ya existe una categoría con ese nombre", status_code=409)

    db.collection(CATEGORIES_COLLECTION).document(category_id).update(model.to_dict())
    return CategoryModel.from_dict(
        db.collection(CATEGORIES_COLLECTION).document(category_id).get().to_dict(),
        category_id,
    )


def delete_category(category_id: str) -> None:
    """
    Elimina una categoría.

    Bloquea la eliminación si existen componentes que la usan,
    obligando al administrador a reasignarlos o eliminarlos primero.
    """
    db = get_db()
    get_category(category_id)  # Verifica que exista

    # Comprobamos si la categoría está en uso por algún componente.
    # Se compara por ID de categoría o por nombre.
    cat = db.collection(CATEGORIES_COLLECTION).document(category_id).get().to_dict()
    cat_name = cat.get("name", "")

    components = db.collection(COMPONENTS_COLLECTION).stream()
    in_use = any(
        comp.to_dict().get("category") in (category_id, cat_name)
        for comp in components
    )

    if in_use:
        raise ApiError(
            "No se puede eliminar la categoría porque hay componentes que la utilizan",
            status_code=409,
        )

    db.collection(CATEGORIES_COLLECTION).document(category_id).delete()
