import { createContext, useState, useEffect, useContext } from "react";
import { axiosInstance, setAuthToken } from "../api/axios";
import { LoaderPage } from "./Loader";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token, logout);
      axiosInstance.get("/users/user").then((result) => {
        console.log("🔄 Fetching User Data:", result);
        setUser(result.data.user);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await axiosInstance.post("/users/login", credentials);
      localStorage.setItem("token", data.token);
      setAuthToken(data.token, logout);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, login }}>
      {isLoading ? <LoaderPage /> : children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};
