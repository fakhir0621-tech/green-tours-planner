import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("gt_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(() => localStorage.getItem("gt_token") || null);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("gt_user", JSON.stringify(userData));
    localStorage.setItem("gt_token", userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("gt_user");
    localStorage.removeItem("gt_token");
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem("gt_user", JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);