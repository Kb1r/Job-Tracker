import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { setApiToken, setUnauthorizedHandler } from '../api/jobs';

const STORAGE_KEY_TOKEN = 'auth_token';
const STORAGE_KEY_NAME = 'auth_first_name';

interface AuthContextValue {
  token: string | null;
  firstName: string | null;
  login: (token: string, firstName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY_TOKEN));
  const [firstName, setFirstName] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY_NAME));

  const login = useCallback((newToken: string, newFirstName: string) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, newToken);
    localStorage.setItem(STORAGE_KEY_NAME, newFirstName);
    setApiToken(newToken);
    setToken(newToken);
    setFirstName(newFirstName);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_NAME);
    setApiToken(null);
    setToken(null);
    setFirstName(null);
  }, []);

  // Sync the token into the API module on mount and register the 401 handler.
  useEffect(() => {
    setApiToken(token);
    setUnauthorizedHandler(logout);
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, firstName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
