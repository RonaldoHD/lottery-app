import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPocketBase, adminLogout as pbAdminLogout, getAdminAuthStore } from '../lib/pocketbase';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already authenticated
    const pb = getPocketBase();
    const store = getAdminAuthStore();
    if (store?.isValid && store?.model) {
      setAdmin(store.model);
    }
    setLoading(false);

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setAdmin(model);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const pb = getPocketBase();
    try {
      // PocketBase v0.20+ uses _superusers collection
      const authData = await pb.collection('_superusers').authWithPassword(email, password);
      setAdmin(authData.record);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    pbAdminLogout();
    setAdmin(null);
  };

  const isAuthenticated = () => {
    const pb = getPocketBase();
    return pb.authStore.isValid && admin !== null;
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, isAuthenticated }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
