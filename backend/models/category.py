"""
Esquema y validación del documento 'Category'.

Estructura almacenada en Firestore (colección 'categories'):

{
  "name": str,  # Nombre de la categoría. Obligatorio y único
}
"""
from core.errors import ApiError


class CategoryModel:
    """Modelo de datos de una categoría."""

    def __init__(self, name, category_id=None):
        self.id = category_id
        self.name = name

    def to_dict(self) -> dict:
        """Devuelve la representación de la categoría como diccionario."""
        data = {"name": self.name}
        if self.id:
            data["id"] = self.id
        return data

    @classmethod
    def from_dict(cls, data: dict, category_id: str = None) -> "CategoryModel":
        """Construye un CategoryModel a partir de un documento Firestore."""
        return cls(
            category_id=category_id or data.get("id"),
            name=data.get("name", ""),
        )


def validate_category_data(data: dict, partial: bool = False) -> CategoryModel:
    """
    Valida los datos de una categoría.

    Solo exige el campo 'name' (texto no vacío y con longitud razonable).
    """
    errors = {}

    if partial and "name" not in data:
        raise ApiError("No se recibieron datos para actualizar", status_code=422)

    name = data.get("name", "")

    if not isinstance(name, str) or not name.strip():
        errors["name"] = "El nombre es obligatorio"
    elif len(name.strip()) > 80:
        errors["name"] = "El nombre no puede superar los 80 caracteres"

    if errors:
        raise ApiError("Datos de la categoría inválidos", status_code=422, details=errors)

    return CategoryModel(name=name.strip())
