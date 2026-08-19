/** Spinner de carga reutilizable. */
import React from "react";

const Spinner = ({ label = "Cargando..." }) => (
  <div className="spinner-wrapper">
    <div className="spinner" aria-label={label} role="status" />
    <p>{label}</p>
  </div>
);

export default Spinner;
