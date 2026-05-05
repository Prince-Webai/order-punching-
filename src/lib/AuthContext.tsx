"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  activeUser: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  activeUser: null,
  login: async () => false,
  logout: () => {},
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/users/mock');
        const data = await res.json();
        
        if (data.success) {
          const cookieMatch = document.cookie.match(/(?:^|;\s*)auth_user_id=([^;]*)/);
          const savedUserId = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
          
          if (savedUserId) {
            const found = data.users.find((u: User) => u.id === savedUserId);
            if (found) {
              setActiveUser(found);
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Protect routes
  useEffect(() => {
    if (!loading) {
      const isPublicPath = pathname === '/login';
      if (!activeUser && !isPublicPath) {
        router.push('/login');
      } else if (activeUser && isPublicPath) {
        router.push('/dashboard');
      }
    }
  }, [activeUser, loading, pathname, router]);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        const user = data.user;
        setActiveUser(user);
        document.cookie = `auth_user_id=${user.id}; path=/; max-age=86400`;
        document.cookie = `mock_user_id=${user.id}; path=/; max-age=86400`; 
        document.cookie = `mock_user_role=${user.role}; path=/; max-age=86400`;
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setActiveUser(null);
    document.cookie = "auth_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "mock_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "mock_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ activeUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
