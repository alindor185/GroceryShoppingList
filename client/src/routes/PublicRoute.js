import { Navigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

export const PublicRoute = ({ children }) => {
  const { user } = useUserContext();
  return user ? <Navigate to="/" replace /> : children;
};

