import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  demoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('teamsync_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('teamsync_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { user } = await authApi.getMe();
        setUser(user);
      } catch (err) {
        console.error('Failed to load user session', err);
        localStorage.removeItem('teamsync_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('teamsync_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    localStorage.setItem('teamsync_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const demoLogin = async () => {
    const demoEmail = 'demo@teamsync.dev';
    const demoPassword = 'Password123!';
    try {
      await login(demoEmail, demoPassword);
    } catch {
      await register('Alex Morgan (Demo)', demoEmail, demoPassword);
    }
  };

  const logout = () => {
    localStorage.removeItem('teamsync_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
