/**
 * Servicio de inventario del frontend.
 *
 * Expone funciones específicas para consumir los endpoints CRUD de
 * categorías y componentes del backend.
 */
import { api } from "./api";

// ---------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------

export const categoryService = {
  list: () => api.get("/categories").then((res) => res.categories),
  create: (data) => api.post("/categories", data).then((res) => res.category),
  update: (id, data) => api.put(`/categories/${id}`, data).then((res) => res.category),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ---------------------------------------------------------------
// Componentes
// ---------------------------------------------------------------

export const componentService = {
  list: (category) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return api.get(`/components${query}`).then((res) => res.components);
  },
  create: (data) => api.post("/components", data).then((res) => res.component),
  update: (id, data) => api.put(`/components/${id}`, data).then((res) => res.component),
  delete: (id) => api.delete(`/components/${id}`),
  adjustStock: (id, delta) =>
    api.patch(`/components/${id}/stock`, { delta }).then((res) => res.component),
  updatePrice: (id, price) =>
    api.patch(`/components/${id}/price`, { price }).then((res) => res.component),
};
