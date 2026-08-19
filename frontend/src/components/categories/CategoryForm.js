/**
 * Formulario de categoría.
 *
 * Permite crear o editar una categoría (campo único: nombre).
 */
import React, { useState } from "react";

const CategoryForm = ({ initial = null, onSave, onCancel }) => {
  const [name, setName] = useState(initial?.name || "");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("El nombre de la categoría es obligatorio.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave(name.trim());
    } catch (error) {
      // Los errores ya se notifican vía toast en el padre.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {formError && <div className="alert alert-error">{formError}</div>}

      <div className="form-group">
        <label htmlFor="category-name">Nombre de la categoría</label>
        <input
          id="category-name"
          type="text"
          placeholder="Ej. Microcontroladores"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="modal-footer-inline">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
