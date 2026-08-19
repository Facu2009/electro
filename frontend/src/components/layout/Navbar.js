/**
 * Barra de navegación superior.
 *
 * Muestra la marca, los enlaces a las secciones principales, el email
 * del usuario y el botón de cerrar sesión. Las credenciales se
 * administran directamente desde Firebase.
 */
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? " nav-link-active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">⚡</span>
        <h1>Inventario Electrónico</h1>
      </div>

      <nav className="navbar-nav">
        <NavLink to="/" className={linkClass} end>
          Inicio
        </NavLink>
        <NavLink to="/categorias" className={linkClass}>
          Categorías
        </NavLink>
        <NavLink to="/componentes" className={linkClass}>
          Componentes
        </NavLink>
      </nav>

      <div className="navbar-actions">
        <span className="navbar-user">{user?.email}</span>
        <button className="btn btn-sm btn-danger" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default Navbar;