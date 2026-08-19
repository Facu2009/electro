/**
 * Página de inicio.
 *
 * Muestra un índice de categorías y de componentes, ambos con enlaces
 * a sus páginas individuales. La gestión completa vive en /categorias
 * y /componentes.
 */
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useInventory from "../hooks/useInventory";
import Spinner from "./ui/Spinner";

const Dashboard = () => {
  const { categories, components, loading, error } = useInventory();

  const [filterCategory, setFilterCategory] = useState("");

  // Cantidad de componentes por categoría.
  const countByCategory = (name) =>
    components.filter((component) => component.category === name).length;

  const visibleComponents = useMemo(() => {
    if (!filterCategory) return components;
    return components.filter((component) => component.category === filterCategory);
  }, [components, filterCategory]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (loading) return <Spinner label="Cargando inventario..." />;

  return (
    <div className="page">
      <section className="card">
        <div className="card-header">
          <h2>Categorías ({categories.length})</h2>
          <Link className="btn btn-primary" to="/categorias">
            Gestionar categorías
          </Link>
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Componentes ({visibleComponents.length})</h2>
          <div className="card-header-actions">
            <select
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filtrar por categoría"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <Link className="btn btn-primary" to="/componentes">
              Gestionar componentes
            </Link>
          </div>
        </div>

        {visibleComponents.length === 0 ? (
          <div className="empty-state">
            No hay componentes. Cargá el primero en la página de gestión.
          </div>
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
                <span className="row-item-link">Ver →</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Dashboard;