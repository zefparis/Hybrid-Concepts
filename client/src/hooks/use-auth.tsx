import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { authService } from "@/lib/auth";
import type { AuthState, User, Company } from "@/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    company: null,
    token: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on app load
    const storedAuth = authService.getStoredAuthData();
    if (storedAuth) {
      setAuthState({
        user: storedAuth.user,
        company: storedAuth.company,
        token: storedAuth.token,
        isAuthenticated: true,
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      const { token, user, company } = response;
      
      authService.saveAuthData(token, user, company);
      setAuthState({
        user,
        company,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      const { token, user, company } = response;
      
      authService.saveAuthData(token, user, company);
      setAuthState({
        user,
        company,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      company: null,
      token: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}