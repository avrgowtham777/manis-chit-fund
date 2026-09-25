import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password, role) => {
    const { data } = await api.post('/auth/login', { username, password, role });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isMember, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
