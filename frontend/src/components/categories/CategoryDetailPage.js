/**
 * Página individual de una categoría.
 *
 * Muestra los datos de la categoría y todos sus componentes. Permite
 * editar/eliminar la categoría y agregar componentes directamente a
 * ella desde esta página.
 */
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useInventory from "../../hooks/useInventory";
import Spinner from "../ui/Spinner";
import Modal from "../ui/Modal";
import CategoryForm from "./CategoryForm";
import ComponentForm from "../components/ComponentForm";
import { useToast } from "../ui/Toast";

const CategoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    categories,
    components,
    loading,
    error,
    updateCategory,
    removeCategory,
    addComponent,
  } = useInventory();

  const { success: notifySuccess, error: notifyError } = useToast();

  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalComponentOpen, setModalComponentOpen] = useState(false);

  const category = categories.find((item) => item.id === id);

  const handleEdit = async (name) => {
    try {
      await updateCategory(id, { name });
      notifySuccess("Categoría actualizada.");
      setModalEditOpen(false);
    } catch (err) {
      notifyError(err.message || "No se pudo actualizar la categoría.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar la categoría "${category?.name}"?`)) return;
    try {
      await removeCategory(id);
      notifySuccess("Categoría eliminada.");
      navigate("/categorias", { replace: true });
    } catch (err) {
      notifyError(err.message || "No se pudo eliminar la categoría.");
    }
  };

  const handleAddComponent = async (data) => {
    try {
      await addComponent(data);
      notifySuccess(`Componente "${data.name}" agregado.`);
      setModalComponentOpen(false);
    } catch (err) {
      notifyError(err.message || "No se pudo crear el componente.");
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;

  if (loading || !category) {
    if (!loading && !category) {
      return (
        <div className="page">
          <Link className="back-link" to="/categorias">
            ← Volver
          </Link>
          <div className="empty-state">La categoría no existe o fue eliminada.</div>
        </div>
      );
    }
    return <Spinner label="Cargando categoría..." />;
  }

  const categoryComponents = components.filter(
    (component) => component.category === category.name
  );

  return (
    <div className="page">
      <Link className="back-link" to="/categorias">
        ← Volver
      </Link>

      <section className="component-section">
        <div className="component-head">
          <div className="component-title">
            <h3>{category.name}</h3>
            <span className="component-category">
              {categoryComponents.length} componentes
            </span>
          </div>
          <div className="component-actions">
            <button className="btn btn-sm" onClick={() => setModalEditOpen(true)}>
              Editar
            </button>
            <button className="btn btn-sm btn-danger" onClick={handleDelete}>
              Eliminar
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Componentes de {category.name}</h2>
          <button
            className="btn btn-primary"
            onClick={() => setModalComponentOpen(true)}
          >
            + Nuevo componente
          </button>
        </div>

        {categoryComponents.length === 0 ? (
          <div className="empty-state">
            Esta categoría no tiene componentes todavía.
          </div>
        ) : (
          <ul className="row-list">
            {categoryComponents.map((component) => (
              <li key={component.id} className="row-item">
                <Link className="row-item-title" to={`/componentes/${component.id}`}>
                  {component.name}
                </Link>
                <span className={`row-item-stock ${component.stock === 0 ? "stock-empty" : ""}`}>
                  {component.stock} u.
                </span>
                <span className="row-item-price">$ {Number(component.price).toFixed(2)}</span>
                <span className="row-item-link">Ver →</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalEditOpen && (
        <Modal title="Editar categoría" onClose={() => setModalEditOpen(false)}>
          <CategoryForm
            initial={category}
            onSave={handleEdit}
            onCancel={() => setModalEditOpen(false)}
          />
        </Modal>
      )}

      {modalComponentOpen && (
        <Modal title="Nuevo componente" onClose={() => setModalComponentOpen(false)}>
          <ComponentForm
            categories={categories}
            defaultCategory={category.name}
            onSave={handleAddComponent}
            onCancel={() => setModalComponentOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default CategoryDetailPage;