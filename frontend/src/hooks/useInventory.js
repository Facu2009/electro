/**
 * Hook para gestionar los datos del inventario.
 *
 * Centraliza la carga, creación, actualización y eliminación de
 * categorías y componentes, exponiendo también un estado de carga
 * y un mecanismo de notificaciones por toast.
 */
import { useCallback, useEffect, useState } from "react";
import { categoryService, componentService } from "../services/inventoryService";

const useInventory = () => {
  const [categories, setCategories] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Carga categorías y componentes de forma paralela. */
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, comps] = await Promise.all([
        categoryService.list(),
        componentService.list(),
      ]);
      setCategories(cats);
      setComponents(comps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---------------- Categorías ----------------
  const addCategory = useCallback(async (data) => {
    const created = await categoryService.create(data);
    setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  }, []);

  const updateCategory = useCallback(async (id, data) => {
    const updated = await categoryService.update(id, data);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const removeCategory = useCallback(
    async (id) => {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    },
    []
  );

  // ---------------- Componentes ----------------
  const addComponent = useCallback(async (data) => {
    const created = await componentService.create(data);
    setComponents((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  }, []);

  const updateComponent = useCallback(async (id, data) => {
    const updated = await componentService.update(id, data);
    setComponents((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const removeComponent = useCallback(async (id) => {
    await componentService.delete(id);
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const adjustStock = useCallback(async (id, delta) => {
    const updated = await componentService.adjustStock(id, delta);
    setComponents((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const setPrice = useCallback(async (id, price) => {
    const updated = await componentService.updatePrice(id, price);
    setComponents((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  return {
    categories,
    components,
    loading,
    error,
    reload: loadAll,
    addCategory,
    updateCategory,
    removeCategory,
    addComponent,
    updateComponent,
    removeComponent,
    adjustStock,
    setPrice,
  };
};

export default useInventory;
