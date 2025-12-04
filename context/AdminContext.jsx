import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAdminAuthStore, adminLogout as pbAdminLogout } from '../lib/pocketbase';

const AdminContext = createContext(null);

// Helper to save admin to localStorage
function saveAdminToStorage(admin) {
  if (typeof window !== 'undefined' && admin) {
    try {
      localStorage.setItem('admin_auth', JSON.stringify({
        ...admin,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Error saving admin to storage:', e);
    }
  }
}

// Helper to get admin from localStorage
function getAdminFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('admin_auth');
    if (stored) {
      const data = JSON.parse(stored);
      // Check if stored data is less than 24 hours old (backup check)
      const hoursSinceStored = (Date.now() - (data.timestamp || 0)) / (1000 * 60 * 60);
      if (hoursSinceStored < 24) {
        return data;
      }
      // Clear stale data
      localStorage.removeItem('admin_auth');
    }
  } catch (e) {
    console.error('Error reading admin from storage:', e);
  }
  return null;
}

// Helper to clear admin from localStorage
function clearAdminFromStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('admin_auth');
    } catch (e) {
      console.error('Error clearing admin from storage:', e);
    }
  }
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only check auth if we're on an admin page
    const isAdminPage = router.pathname?.startsWith('/admin');
    
    if (isAdminPage) {
      // First check cookie (primary source)
      const store = getAdminAuthStore();
      
      if (store?.isValid && store?.model) {
        setAdmin(store.model);
        // Also save to localStorage as backup
        saveAdminToStorage(store.model);
      } else {
        // Fallback to localStorage (for page refreshes)
        const storedAdmin = getAdminFromStorage();
        if (storedAdmin) {
          setAdmin(storedAdmin);
        } else if (router.pathname !== '/admin/login') {
          // No valid auth found, redirect to login
          router.push('/admin/login');
        }
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
      const adminModel = authData.record || authData.admin || authData;
      setAdmin(adminModel);
      // Save to localStorage as backup
      saveAdminToStorage(adminModel);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    pbAdminLogout();
    setAdmin(null);
    clearAdminFromStorage();
    router.push('/admin/login');
  };

  const isAuthenticated = () => {
    // Check if we have admin in state
    if (admin !== null) {
      return true;
    }
    
    // Check cookie
    const store = getAdminAuthStore();
    if (store?.isValid) {
      return true;
    }
    
    // Check localStorage as final fallback
    const storedAdmin = getAdminFromStorage();
    if (storedAdmin) {
      return true;
    }
    
    return false;
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
