'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { decodeJwtPayload, type JwtUserPayload } from '../util/jwt.util';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  login: (token: string) => void;
  logout: () => void;
}

const AUTH_COOKIE_NAME = 'auth_token';
const AUTH_COOKIE_EXPIRES_IN_DAYS = 7;

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(payload: JwtUserPayload): AuthUser {
  return { id: payload.sub, name: payload.name, email: payload.email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const clearSession = useCallback(() => {
    Cookies.remove(AUTH_COOKIE_NAME);
    setUser(null);
    setToken(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    const storedToken = Cookies.get(AUTH_COOKIE_NAME);
    const payload = storedToken ? decodeJwtPayload(storedToken) : null;

    if (storedToken && payload) {
      setUser(toAuthUser(payload));
      setToken(storedToken);
      setStatus('authenticated');
      return;
    }

    clearSession();
  }, [clearSession]);

  const login = useCallback(
    (newToken: string) => {
      const payload = decodeJwtPayload(newToken);

      if (!payload) {
        clearSession();
        return;
      }

      Cookies.set(AUTH_COOKIE_NAME, newToken, {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        expires: AUTH_COOKIE_EXPIRES_IN_DAYS,
      });
      setUser(toAuthUser(payload));
      setToken(newToken);
      setStatus('authenticated');
    },
    [clearSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, status, login, logout: clearSession }),
    [user, token, status, login, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }

  return context;
}

export { AuthContext };
