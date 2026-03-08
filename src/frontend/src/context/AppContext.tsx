import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import type { User } from "../backend.d";

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("guccora_user");
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem("guccora_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("guccora_user");
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  const isAdmin = currentUser?.role === "admin";

  return (
    <AppContext.Provider
      value={{ currentUser, setCurrentUser, logout, isAdmin }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
