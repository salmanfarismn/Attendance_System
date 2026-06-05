import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aw_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aw_token');
    if (token) {
      authAPI.getMe()
        .then((res) => { setUser(res.data.user); localStorage.setItem('aw_user', JSON.stringify(res.data.user)); })
        .catch(() => { localStorage.removeItem('aw_token'); localStorage.removeItem('aw_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: u } = res.data;
    localStorage.setItem('aw_token', token);
    localStorage.setItem('aw_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token, user: u } = res.data;
    localStorage.setItem('aw_token', token);
    localStorage.setItem('aw_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('aw_token');
    localStorage.removeItem('aw_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('aw_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
