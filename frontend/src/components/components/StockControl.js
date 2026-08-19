/**
 * Control rápido de stock y precio.
 *
 * Permite aumentar/disminuir el stock con botones + y -, y editar el
 * precio directamente sobre la tarjeta del componente.
 */
import React, { useState } from "react";

const StockControl = ({ component, onAdjustStock, onUpdatePrice }) => {
  const [delta, setDelta] = useState(1);
  const [priceDraft, setPriceDraft] = useState(String(component.price));
  const [saving, setSaving] = useState(false);

  const applyDelta = async (sign) => {
    setSaving(true);
    try {
      await onAdjustStock(component.id, sign * delta);
    } finally {
      setSaving(false);
    }
  };

  const handlePriceSubmit = async (event) => {
    event.preventDefault();
    const value = Number(priceDraft);
    if (!value || value <= 0) return;

    setSaving(true);
    try {
      await onUpdatePrice(component.id, value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stock-control">
      <div className="stock-row">
        <div className="stock-adjust">
          <label>Stock</label>
          <div className="stock-input-group">
            <input
              type="number"
              min="1"
              step="1"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value) || 1)}
              aria-label="Cantidad a ajustar"
            />
            <button
              className="btn btn-sm"
              onClick={() => applyDelta(-1)}
              disabled={saving}
              aria-label="Disminuir stock"
            >
              −
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => applyDelta(1)}
              disabled={saving}
              aria-label="Aumentar stock"
            >
              +
            </button>
          </div>
          <span className={`stock-badge ${component.stock === 0 ? "stock-empty" : ""}`}>
            {component.stock} unidades
          </span>
        </div>

        <form className="price-adjust" onSubmit={handlePriceSubmit}>
          <label htmlFor={`price-${component.id}`}>Precio ($)</label>
          <div className="price-input-group">
            <input
              id={`price-${component.id}`}
              type="number"
              min="0.01"
              step="0.01"
              value={priceDraft}
              onChange={(e) => setPriceDraft(e.target.value)}
            />
            <button className="btn btn-sm btn-primary" type="submit" disabled={saving}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockControl;
