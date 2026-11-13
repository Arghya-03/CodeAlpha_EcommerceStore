
import { createContext, useContext, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("shopnest_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", userData);

      localStorage.setItem("shopnest_token", data.token);
      localStorage.setItem("shopnest_user", JSON.stringify(data.user));
      setUser(data.user);

      return data;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", credentials);

      localStorage.setItem("shopnest_token", data.token);
      localStorage.setItem("shopnest_user", JSON.stringify(data.user));
      setUser(data.user);

      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("shopnest_token");
    localStorage.removeItem("shopnest_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
