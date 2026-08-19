/**
 * Página individual de un componente.
 *
 * Muestra todos los datos del componente y el control rápido de stock
 * y precio. Permite editar y eliminar desde la propia página.
 */
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useInventory from "../../hooks/useInventory";
import Spinner from "../ui/Spinner";
import Modal from "../ui/Modal";
import ComponentForm from "./ComponentForm";
import StockControl from "./StockControl";
import { useToast } from "../ui/Toast";

const ComponentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    categories,
    components,
    loading,
    error,
    updateComponent,
    removeComponent,
    adjustStock,
    setPrice,
  } = useInventory();

  const { success: notifySuccess, error: notifyError } = useToast();

  const [editing, setEditing] = useState(false);

  const component = components.find((item) => item.id === id);

  const handleSave = async (data) => {
    try {
      await updateComponent(id, data);
      notifySuccess("Componente actualizado.");
      setEditing(false);
    } catch (err) {
      notifyError(err.message || "No se pudo actualizar el componente.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar el componente "${component?.name}"?`)) return;
    try {
      await removeComponent(id);
      notifySuccess("Componente eliminado.");
      navigate("/componentes", { replace: true });
    } catch (err) {
      notifyError(err.message || "No se pudo eliminar el componente.");
    }
  };

  const handleAdjustStock = async (componentId, delta) => {
    try {
      await adjustStock(componentId, delta);
    } catch (err) {
      notifyError(err.message || "No se pudo ajustar el stock.");
    }
  };

  const handlePrice = async (componentId, price) => {
    try {
      await setPrice(componentId, price);
      notifySuccess("Precio actualizado.");
    } catch (err) {
      notifyError(err.message || "No se pudo actualizar el precio.");
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;

  // Mientras carga o si aún no encuentra el componente (la hook carga todo).
  if (loading || !component) {
    if (!loading && !component) {
      return (
        <div className="page">
          <Link className="back-link" to="/componentes">
            ← Volver
          </Link>
          <div className="empty-state">El componente no existe o fue eliminado.</div>
        </div>
      );
    }
    return <Spinner label="Cargando componente..." />;
  }

  return (
    <div className="page">
      <Link className="back-link" to="/componentes">
        ← Volver
      </Link>

      <section className="component-section component-detail">
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
          onAdjustStock={handleAdjustStock}
          onUpdatePrice={handlePrice}
        />
      </section>

      {editing && (
        <Modal title="Editar componente" onClose={() => setEditing(false)}>
          <ComponentForm
            categories={categories}
            initial={component}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ComponentDetailPage;