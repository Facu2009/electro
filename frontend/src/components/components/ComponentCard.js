/**
 * Sección de componente.
 *
 * Cada componente ocupa un apartado separado a ancho completo dentro del
 * inventario. Al agregar un componente aparece una nueva sección y al
 * eliminarlo esta desaparece.
 */
import React, { useState } from "react";
import Modal from "../ui/Modal";
import ComponentForm from "./ComponentForm";
import StockControl from "./StockControl";

const ComponentSection = ({
  component,
  categories,
  onUpdate,
  onDelete,
  onAdjustStock,
  onUpdatePrice,
}) => {
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar el componente "${component.name}"?`)) return;
    await onDelete(component.id);
  };

  return (
    <article className="component-section">
      <div className="component-head">
        <div className="component-title">
          <h3>{component.name}</h3>
          <span className="component-category">{component.category}</span>
        </div>
        <div className="component-actions">
          <button className="btn btn-sm" onClick={() => setEditing(true)}>
            Editar
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleDelete}>
            Eliminar
          </button>
        </div>
      </div>

      <p className="component-specs">{component.specs}</p>

      <StockControl
        component={component}
        onAdjustStock={onAdjustStock}
        onUpdatePrice={onUpdatePrice}
      />

      {editing && (
        <Modal title="Editar componente" onClose={() => setEditing(false)}>
          <ComponentForm
            categories={categories}
            initial={component}
            onSave={async (data) => {
              await onUpdate(component.id, data);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </Modal>
      )}
    </article>
  );
};

export default ComponentSection;