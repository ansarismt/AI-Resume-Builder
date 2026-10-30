import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getCurrentUser } from "@/lib/resumeApi";

interface AuthContextValue {
  token: string | null;
  username: string | null;
  email: string | null;
  loginAt: string | null;
  isStaff: boolean;
  login: (username: string, token: string, email?: string, isStaff?: boolean) => void;
  updateAccount: (username: string, token: string, email?: string, isStaff?: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loginAt, setLoginAt] = useState<string | null>(null);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("username");
    const e = localStorage.getItem("email");
    const started = localStorage.getItem("loginAt");
    if (t) setToken(t);
    if (u) setUsername(u);
    if (e) setEmail(e);
    if (started) setLoginAt(started);
    if (t) {
      getCurrentUser()
        .then((user) => {
          setUsername(user.username);
          setEmail(user.email);
          setIsStaff(user.is_staff);
        })
        .catch((error: unknown) => {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("email");
            localStorage.removeItem("loginAt");
            setToken(null);
            setUsername(null);
            setEmail(null);
            setLoginAt(null);
            setIsStaff(false);
            return;
          }
          console.error("Could not verify the saved session.", error);
        });
    }
  }, []);

  const login = (u: string, t: string, e = "", staff = false) => {
    const started = new Date().toISOString();
    localStorage.setItem("token", t);
    localStorage.setItem("username", u);
    localStorage.setItem("loginAt", started);
    if (e) localStorage.setItem("email", e);
    else localStorage.removeItem("email");
    setToken(t);
    setUsername(u);
    setEmail(e || null);
    setLoginAt(started);
    setIsStaff(staff);
  };

  const updateAccount = (u: string, t: string, e = "", staff = isStaff) => {
    localStorage.setItem("token", t);
    localStorage.setItem("username", u);
    if (e) localStorage.setItem("email", e);
    else localStorage.removeItem("email");
    setToken(t);
    setUsername(u);
    setEmail(e || null);
    setIsStaff(staff);
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
    setIsStaff(false);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        email,
        loginAt,
        isStaff,
        login,
        updateAccount,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
