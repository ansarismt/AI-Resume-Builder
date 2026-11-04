import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { getApiErrorMessage, getCurrentUser, logoutApi } from "@/lib/resumeApi";

interface AuthContextValue {
  token: string | null;
  username: string | null;
  email: string | null;
  loginAt: string | null;
  isStaff: boolean;
  login: (username: string, token: string, email?: string, isStaff?: boolean) => void;
  updateAccount: (username: string, token: string, email?: string, isStaff?: boolean) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredValue(key: string) {
  return typeof window === "undefined" ? null : window.localStorage.getItem(key);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredValue("token"));
  const [username, setUsername] = useState<string | null>(() => readStoredValue("username"));
  const [email, setEmail] = useState<string | null>(() => readStoredValue("email"));
  const [loginAt, setLoginAt] = useState<string | null>(() => readStoredValue("loginAt"));
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;
    getCurrentUser()
      .then((user) => {
        if (!active) return;
        setUsername(user.username);
        setEmail(user.email);
        setIsStaff(user.is_staff);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          window.localStorage.removeItem("token");
          window.localStorage.removeItem("username");
          window.localStorage.removeItem("email");
          window.localStorage.removeItem("loginAt");
          setToken(null);
          setUsername(null);
          setEmail(null);
          setLoginAt(null);
          setIsStaff(false);
          return;
        }
        toast.error(
          getApiErrorMessage(error, "Could not verify the saved session. Check your connection."),
        );
      });

    return () => {
      active = false;
    };
  }, [token]);

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

  const logout = async () => {
    await logoutApi();
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
