import { Navigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

export const ProtectedRoute = ({ children }) => {
  const { user } = useUserContext();
  return user ? children : <Navigate to="/login" replace />;
};

