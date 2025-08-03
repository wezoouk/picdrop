
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  weddingId: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Check for a logged-in user in sessionStorage
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('currentUser');
    }
  }, []);

  const login = (userData: User) => {
    const userToStore: User = { ...userData };

    if (userToStore.email === 'admin@picdrop.com') {
      userToStore.isAdmin = true;
    }

    // The currently logged-in user is stored in sessionStorage for session persistence.
    sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
    setUser(userToStore);
    
    if (userToStore.isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('currentUser');
    setUser(null);
    navigate('/');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};