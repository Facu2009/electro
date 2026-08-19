/**
 * Componente raíz de la aplicación.
 *
 * Define el enrutado, provee el contexto de autenticación y el sistema
 * de toasts. Las rutas del panel están protegidas por ProtectedRoute.
 *
 * Rutas:
 *   /login                    -> Inicio de sesión
 *   /                         -> Inicio (índice de categorías y componentes)
 *   /categorias               -> Gestión de categorías (agregar/editar/eliminar)
 *   /categorias/:id           -> Página individual de una categoría
 *   /componentes              -> Gestión de componentes (agregar/editar/eliminar)
 *   /componentes/:id          -> Página individual de un componente
 */
import React from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Login from "./components/auth/Login";
import Dashboard from "./components/Dashboard";
import ComponentsPage from "./components/components/ComponentsPage";
import ComponentDetailPage from "./components/components/ComponentDetailPage";
import CategoriesPage from "./components/categories/CategoriesPage";
import CategoryDetailPage from "./components/categories/CategoryDetailPage";
import Spinner from "./components/ui/Spinner";

/** Layout protegido: Navbar + contenedor + páginas hijas (Outlet). */
const ProtectedLayout = () => (
  <>
    <Navbar />
    <main className="container">
      <Outlet />
    </main>
  </>
);

/** Redirige a /login si ya hay sesión (para evitar el doble login). */
const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Cargando..." />;
  if (user) return <Navigate to="/" replace />;

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicOnly>
          <Login />
        </PublicOnly>
      }
    />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <ProtectedLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="categorias" element={<CategoriesPage />} />
      <Route path="categorias/:id" element={<CategoryDetailPage />} />
      <Route path="componentes" element={<ComponentsPage />} />
      <Route path="componentes/:id" element={<ComponentDetailPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;