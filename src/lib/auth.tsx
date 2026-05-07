import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  token: string | null;
  username: string | null;
  email: string | null;
  loginAt: string | null;
  login: (username: string, token: string, email?: string) => void;
  updateAccount: (username: string, token: string, email?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loginAt, setLoginAt] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("username");
    const e = localStorage.getItem("email");
    const started = localStorage.getItem("loginAt");
    if (t) setToken(t);
    if (u) setUsername(u);
    if (e) setEmail(e);
    if (started) setLoginAt(started);
  }, []);

  const login = (u: string, t: string, e = "") => {
    const started = new Date().toISOString();
    localStorage.setItem("token", t);
    localStorage.setItem("username", u);
    localStorage.setItem("loginAt", started);
    if (e) localStorage.setItem("email", e);
    setToken(t);
    setUsername(u);
    setEmail(e || null);
    setLoginAt(started);
  };

  const updateAccount = (u: string, t: string, e = "") => {
    localStorage.setItem("token", t);
    localStorage.setItem("username", u);
    if (e) localStorage.setItem("email", e);
    setToken(t);
    setUsername(u);
    setEmail(e || null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("loginAt");
    setToken(null);
    setUsername(null);
    setEmail(null);
    setLoginAt(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ token, username, email, loginAt, login, updateAccount, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
