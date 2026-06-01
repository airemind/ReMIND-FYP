import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  const location = useLocation();

  /* LOADING */

  if (loading) {
    return <div>Loading...</div>;
  }

  /* =========================
     ADMIN ROUTES
  ========================= */

  if (location.pathname.startsWith("/admin")) {
    const adminToken = localStorage.getItem("admin_token");

    if (!adminToken) {
      return <Navigate to="/admin-portal" replace />;
    }

    return children;
  }

  /* =========================
     NORMAL USER ROUTES
  ========================= */

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
