/**
 * Página de gestión de categorías.
 *
 * Punto único para agregar, editar y eliminar categorías. Cada fila
 * enlaza a la página individual de la categoría, donde se administran
 * sus componentes.
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import useInventory from "../../hooks/useInventory";
import Spinner from "../ui/Spinner";
import Modal from "../ui/Modal";
import CategoryForm from "./CategoryForm";
import { useToast } from "../ui/Toast";

const CategoriesPage = () => {
  const {
    categories,
    components,
    loading,
    error,
    addCategory,
    updateCategory,
    removeCategory,
  } = useInventory();

  const { success: notifySuccess, error: notifyError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Cantidad de componentes por categoría (se agrupa por nombre).
  const countByCategory = (name) =>
    components.filter((component) => component.category === name).length;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setModalOpen(true);
  };

  const handleSave = async (name) => {
    try {
      if (editing) {
        await updateCategory(editing.id, { name });
        notifySuccess("Categoría actualizada.");
      } else {
        await addCategory({ name });
        notifySuccess("Categoría creada.");
      }
      setModalOpen(false);
    } catch (err) {
      notifyError(err.message || "No se pudo guardar la categoría.");
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    try {
      await removeCategory(category.id);
      notifySuccess("Categoría eliminada.");
    } catch (err) {
      notifyError(err.message || "No se pudo eliminar la categoría.");
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (loading) return <Spinner label="Cargando categorías..." />;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Categorías</h1>
          <p className="page-subtitle">
            Agrega, edita o elimina categorías. Clic en una categoría para ver sus
            componentes.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nueva categoría
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">No hay categorías registradas.</div>
      ) : (
        <ul className="row-list">
          {categories.map((category) => (
            <li key={category.id} className="row-item">
              <Link className="row-item-title" to={`/categorias/${category.id}`}>
                {category.name}
              </Link>
              <span className="row-item-category">
                {countByCategory(category.name)} componentes
              </span>
              <span className="row-item-link">Ver →</span>
              <div className="row-item-actions">
                <button className="btn btn-sm" onClick={() => openEdit(category)}>
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(category)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <Modal
          title={editing ? "Editar categoría" : "Nueva categoría"}
          onClose={() => setModalOpen(false)}
        >
          <CategoryForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default CategoriesPage;