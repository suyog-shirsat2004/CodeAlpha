import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token) {
          setUser(parsed);
          authAPI.getMe().then((res) => {
            const updated = { ...parsed, ...res.data };
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
          }).catch((err) => {
            if (err.response && err.response.status >= 400 && err.response.status < 500) {
              localStorage.removeItem('user');
              setUser(null);
            }
          });
        }
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const isBackendOffline = (err) => {
    return !err.response || typeof err.response?.data === 'string';
  };

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      const userData = { ...data };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      if (isBackendOffline(err)) {
        const stored = localStorage.getItem('demo_users');
        const users = stored ? JSON.parse(stored) : [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          const mockUser = { _id: user._id || 'demo_' + Date.now(), name: user.name, email: user.email, token: 'demo_' + Date.now() };
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          return mockUser;
        }
      }
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await authAPI.register({ name, email, password });
      const userData = { ...data };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      if (isBackendOffline(err)) {
        const stored = localStorage.getItem('demo_users');
        const users = stored ? JSON.parse(stored) : [];
        const demoId = 'demo_' + Date.now();
        users.push({ _id: demoId, name, email, password });
        localStorage.setItem('demo_users', JSON.stringify(users));
        const mockUser = { _id: demoId, name, email, token: 'demo_' + Date.now() };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return mockUser;
      }
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
