import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { User, isAuthenticated, getToken } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(getToken());

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!token && isAuthenticated(),
    retry: false,
  });

  useEffect(() => {
    const currentToken = getToken();
    setToken(currentToken);
    
    if (!currentToken || !isAuthenticated()) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        setLocation("/login");
      }
    }
  }, [setLocation]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user && !token) {
      setLocation("/login");
    }
  }, [user, isLoading, token, setLocation]);

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, token }}>
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
