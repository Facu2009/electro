"""
Esquema y validación del documento 'Component'.

Estructura almacenada en Firestore (colección 'components'):

{
  "name":         str,  # Obligatorio
  "specs":        str,  # Especificaciones técnicas. Obligatorio
  "category":     str,  # Nombre o ID de la categoría. Obligatorio
  "stock":        int,  # Cantidad disponible. Obligatorio (>= 0)
  "price":        float # Precio unitario. Obligatorio (> 0)
}
"""
from core.errors import ApiError

REQUIRED_FIELDS = {"name", "specs", "category", "stock", "price"}


class ComponentModel:
    """Modelo de datos de un componente electrónico."""

    def __init__(self, name, specs, category, stock, price, component_id=None):
        self.id = component_id
        self.name = name
        self.specs = specs
        self.category = category
        self.stock = stock
        self.price = price

    def to_dict(self) -> dict:
        """Devuelve la representación del componente como diccionario."""
        data = {
            "name": self.name,
            "specs": self.specs,
            "category": self.category,
            "stock": self.stock,
            "price": self.price,
        }
        if self.id:
            data["id"] = self.id
        return data

    @classmethod
    def from_dict(cls, data: dict, component_id: str = None) -> "ComponentModel":
        """Construye un ComponentModel a partir de un documento Firestore."""
        return cls(
            component_id=component_id or data.get("id"),
            name=data.get("name", ""),
            specs=data.get("specs", ""),
            category=data.get("category", ""),
            stock=data.get("stock", 0),
            price=data.get("price", 0.0),
        )


def validate_component_data(data: dict, partial: bool = False) -> ComponentModel:
    """
    Valida los datos de un componente y devuelve una instancia del modelo.

    - `partial=False`: valida la creación (todos los campos obligatorios).
    - `partial=True` : valida una actualización (solo campos presentes).
    Lanza ApiError con los detalles de validación si algo falla.
    """
    errors = {}

    # Solo validamos los campos que vienen en el payload.
    fields = data if partial else REQUIRED_FIELDS

    for field in fields:
        if field not in data:
            errors[field] = "Campo obligatorio"
            continue
        value = data[field]

        if field in ("name", "specs", "category"):
            if not isinstance(value, str) or not value.strip():
                errors[field] = "Debe ser un texto no vacío"

        elif field == "stock":
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                errors[field] = "Debe ser un número"
            elif value < 0:
                errors[field] = "No puede ser negativo"

        elif field == "price":
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                errors[field] = "Debe ser un número"
            elif value <= 0:
                errors[field] = "Debe ser mayor que cero"

    if errors:
        raise ApiError("Datos del componente inválidos", status_code=422, details=errors)

    # Se aplican los valores ya validados (o los del payload original).
    return ComponentModel(
        name=data["name"].strip(),
        specs=data["specs"].strip(),
        category=data["category"].strip(),
        stock=int(data["stock"]),
        price=float(data["price"]),
    )
