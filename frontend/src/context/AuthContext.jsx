import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("hireflow_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("hireflow_token") || null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthData = useCallback((newUser, newToken) => {
    setUser(newUser);
    setToken(newToken);
    if (newUser && newToken) {
      localStorage.setItem("hireflow_user", JSON.stringify(newUser));
      localStorage.setItem("hireflow_token", newToken);
    } else {
      localStorage.removeItem("hireflow_user");
      localStorage.removeItem("hireflow_token");
    }
  }, []);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("hireflow_token");
      if (!savedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("hireflow_user", JSON.stringify(res.data.user));
        }
      } catch {
        setAuthData(null, null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    const handleExpired = () => setAuthData(null, null);
    window.addEventListener("hireflow:auth_expired", handleExpired);
    return () => window.removeEventListener("hireflow:auth_expired", handleExpired);
  }, [setAuthData]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.success && res.data) {
      setAuthData(res.data.user, res.data.token);
      return res.data.user;
    }
    throw new Error(res.message || "Login failed");
  };

  const register = async ({ name, email, password, role }) => {
    const res = await api.post("/auth/register", { name, email, password, role });
    if (res.success && res.data) {
      setAuthData(res.data.user, res.data.token);
      return res.data.user;
    }
    throw new Error(res.message || "Registration failed");
  };

  const logout = useCallback(() => {
    setAuthData(null, null);
  }, [setAuthData]);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem("hireflow_user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        role: user?.role || null,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
