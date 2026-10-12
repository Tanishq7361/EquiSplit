import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authApi from '../api/authApi';
import { useServerLoader } from "./ServerLoaderContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const { showLoader, hideLoader } = useServerLoader();

  // Sync user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // Optionally fetch fresh profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      authApi.getProfile()
        .then(({ data }) => {
          if (data) {
            setUser(prev => ({ ...(prev || {}), ...data }));
          }
        })
        .catch(() => {
          // Ignore background fetch failure, use cached local user
        });
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    showLoader();
    try {
      const { data } = await authApi.login(credentials);
      const { token, ...userData } = data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true, data: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  const loginWithGoogle = useCallback(async (idToken) => {
    setLoading(true);
    setError(null);
    showLoader();
    try {
      const { data } = await authApi.googleLogin({ idToken });
      const { token, ...userData } = data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true, data: userData };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Google login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    showLoader();
    try {
      await authApi.register(userData);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser(prev => {
      if (!prev) return prev;
      return { ...prev, ...updatedFields };
    });
  }, []);

  const updateUsername = useCallback((newName) => {
    setUser(prev => prev ? { ...prev, name: newName } : null);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authApi.updateProfile(profileData);
      setUser(prev => ({ ...(prev || {}), ...data }));
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    clearError,
    updateUser,
    updateUsername,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

