import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAdminAuthStore, adminLogout as pbAdminLogout } from '../lib/pocketbase';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only check auth if we're on an admin page - NO API CALLS
    const isAdminPage = router.pathname?.startsWith('/admin');
    
    if (isAdminPage) {
      // Check auth synchronously from cookie/cache only - NO API CALL
      const store = getAdminAuthStore();
      if (store?.isValid && store?.model) {
        setAdmin(store.model);
      } else if (router.pathname !== '/admin/login') {
        // Redirect to login if not authenticated and not already on login page
        router.push('/admin/login');
      }
    }
    setLoading(false);
  }, [router.pathname]);

  const login = async (email, password) => {
    const { getPocketBase } = await import('../lib/pocketbase');
    const pb = getPocketBase();
    try {
      // Use admins API for authentication
      const authData = await pb.admins.authWithPassword(email, password);
      setAdmin(authData.record);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    pbAdminLogout();
    setAdmin(null);
    router.push('/admin/login');
  };

  const isAuthenticated = () => {
    // Check synchronously from cache/cookie - NO API CALL
    const store = getAdminAuthStore();
    return store?.isValid && admin !== null;
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


