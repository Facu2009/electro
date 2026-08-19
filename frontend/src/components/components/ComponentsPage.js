/**
 * Página de gestión de componentes.
 *
 * Punto único para agregar, editar y eliminar componentes. Cada fila
 * enlaza a la página individual del componente.
 */
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useInventory from "../../hooks/useInventory";
import Spinner from "../ui/Spinner";
import Modal from "../ui/Modal";
import ComponentForm from "./ComponentForm";
import { useToast } from "../ui/Toast";

const ComponentsPage = () => {
  const {
    categories,
    components,
    loading,
    error,
    addComponent,
    updateComponent,
    removeComponent,
  } = useInventory();

  const { success: notifySuccess, error: notifyError } = useToast();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Filtro combinado: texto + categoría.
  const visibleComponents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return components.filter((component) => {
      const matchesCategory = !filterCategory || component.category === filterCategory;
      const matchesSearch =
        !term || component.name.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [components, search, filterCategory]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (component) => {
    setEditing(component);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateComponent(editing.id, data);
        notifySuccess("Componente actualizado.");
      } else {
        await addComponent(data);
        notifySuccess(`Componente "${data.name}" agregado.`);
      }
      setModalOpen(false);
    } catch (err) {
      notifyError(err.message || "No se pudo guardar el componente.");
    }
  };

  const handleDelete = async (component) => {
    if (!window.confirm(`¿Eliminar el componente "${component.name}"?`)) return;
    try {
      await removeComponent(component.id);
      notifySuccess("Componente eliminado.");
    } catch (err) {
      notifyError(err.message || "No se pudo eliminar el componente.");
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (loading) return <Spinner label="Cargando componentes..." />;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Componentes</h1>
          <p className="page-subtitle">
            Agrega, edita o elimina componentes del inventario.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuevo componente
        </button>
      </div>

      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {visibleComponents.length === 0 ? (
        <div className="empty-state">No hay componentes que coincidan con tu búsqueda.</div>
      ) : (
        <ul className="row-list">
          {visibleComponents.map((component) => (
            <li key={component.id} className="row-item">
              <Link className="row-item-title" to={`/componentes/${component.id}`}>
                {component.name}
              </Link>
              <span className="row-item-category">{component.category}</span>
              <span className={`row-item-stock ${component.stock === 0 ? "stock-empty" : ""}`}>
                {component.stock} u.
              </span>
              <span className="row-item-price">$ {Number(component.price).toFixed(2)}</span>
              <div className="row-item-actions">
                <button className="btn btn-sm" onClick={() => openEdit(component)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(component)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <Modal
          title={editing ? "Editar componente" : "Nuevo componente"}
          onClose={() => setModalOpen(false)}
        >
          <ComponentForm
            categories={categories}
            initial={editing}
            onSave={handleSave}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ComponentsPage;