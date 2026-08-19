/**
 * Formulario de componente.
 *
 * Permite crear o editar un componente electrónico con todos sus
 * atributos obligatorios: nombre, especificaciones, categoría, stock
 * y precio.
 */
import React, { useState } from "react";

const EMPTY_FORM = {
  name: "",
  specs: "",
  category: "",
  stock: "",
  price: "",
};

const ComponentForm = ({
  categories,
  initial = null,
  defaultCategory = "",
  onSave,
  onCancel,
}) => {
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          specs: initial.specs,
          category: initial.category,
          stock: String(initial.stock),
          price: String(initial.price),
        }
      : { ...EMPTY_FORM, category: defaultCategory }
  );
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    // Validación del formulario.
    if (!form.name.trim()) return setFormError("El nombre es obligatorio.");
    if (!form.specs.trim()) return setFormError("Las especificaciones son obligatorias.");
    if (!form.category) return setFormError("Selecciona una categoría.");
    if (form.stock === "" || Number(form.stock) < 0)
      return setFormError("El stock debe ser un número mayor o igual a 0.");
    if (form.price === "" || Number(form.price) <= 0)
      return setFormError("El precio debe ser un número mayor que 0.");

    setSubmitting(true);
    try {
      await onSave({
        name: form.name.trim(),
        specs: form.specs.trim(),
        category: form.category,
        stock: Number(form.stock),
        price: Number(form.price),
      });
    } catch (error) {
      // Los errores de la API se notifican en el componente padre.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {formError && <div className="alert alert-error">{formError}</div>}

      <div className="form-group">
        <label htmlFor="comp-name">Nombre del componente</label>
        <input
          id="comp-name"
          name="name"
          type="text"
          placeholder="Ej. Resistencia 1k Ohm 1/4W"
          value={form.name}
          onChange={handleChange}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="comp-specs">Especificaciones técnicas</label>
        <textarea
          id="comp-specs"
          name="specs"
          rows="3"
          placeholder="Ej. Tolerancia 5%, encapsulado axial, 1/4W"
          value={form.specs}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="comp-category">Categoría</label>
          <select
            id="comp-category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Selecciona...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="comp-stock">Stock disponible</label>
          <input
            id="comp-stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.stock}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="comp-price">Precio ($)</label>
          <input
            id="comp-price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.price}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="modal-footer-inline">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar componente"}
        </button>
      </div>
    </form>
  );
};

export default ComponentForm;
