"use client";

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  activeUser: User | null;
  users: User[];
  switchUser: (userId: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  activeUser: null,
  users: [],
  switchUser: () => {},
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available mock users
    fetch('/api/users/mock')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.users.length > 0) {
          setUsers(data.users);
          
          // Check for existing cookie
          const cookieMatch = document.cookie.match(/(?:^|;\s*)mock_user_id=([^;]*)/);
          const savedUserId = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
          
          if (savedUserId) {
            const found = data.users.find((u: User) => u.id === savedUserId);
            if (found) {
              setActiveUser(found);
            } else {
              setActiveUser(data.users[0]);
              document.cookie = `mock_user_id=${data.users[0].id}; path=/`;
              document.cookie = `mock_user_role=${data.users[0].role}; path=/`;
            }
          } else {
            setActiveUser(data.users[0]);
            document.cookie = `mock_user_id=${data.users[0].id}; path=/`;
            document.cookie = `mock_user_role=${data.users[0].role}; path=/`;
          }
        }
        setLoading(false);
      });
  }, []);

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setActiveUser(user);
      document.cookie = `mock_user_id=${user.id}; path=/`;
      document.cookie = `mock_user_role=${user.role}; path=/`;
      // Reload the page to refresh all data globally
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ activeUser, users, switchUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
