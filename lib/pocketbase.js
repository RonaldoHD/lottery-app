// Proxy all requests through Next.js API routes
const API_BASE = '/api/pocketbase';

// Helper to remove undefined/null values from an object
function cleanParams(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Helper function to make API requests
async function apiRequest(operation, params = {}) {
  // Don't make requests if operation is missing
  if (!operation) {
    throw new Error('Operation is required');
  }

  // Clean params to remove undefined/null values
  const cleanedParams = cleanParams(params);

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
    body: JSON.stringify({
      operation,
      ...cleanedParams,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'API request failed' }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Cache for auth store to avoid repeated API calls
let authStoreCache = null;
let authStoreCacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Event listeners for auth changes
const authChangeListeners = new Set();

// Helper to get auth store from server (only when needed)
async function getAuthStoreAsync() {
  if (typeof window === 'undefined') {
    return { isValid: false, model: null, token: null };
  }
  
  // Return cached value if still valid
  const now = Date.now();
  if (authStoreCache && (now - authStoreCacheTime) < CACHE_DURATION) {
    return authStoreCache;
  }
  
  try {
    const store = await apiRequest('getAuthStore');
    authStoreCache = store;
    authStoreCacheTime = now;
    return store;
  } catch (e) {
    authStoreCache = { isValid: false, model: null, token: null };
    authStoreCacheTime = now;
    return authStoreCache;
  }
}

// Synchronous version (may return stale data)
function getAuthStore() {
  if (typeof window === 'undefined') {
    return { isValid: false, model: null, token: null };
  }
  
  // Return cached value if available
  if (authStoreCache) {
    return authStoreCache;
  }
  
  // Try to get from cookie as fallback
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('pb_auth='));
  if (authCookie) {
    try {
      // PocketBase cookie format: pb_auth=base64encodedjson
      const cookieValue = authCookie.split('=').slice(1).join('=');
      const decoded = atob(cookieValue);
      const authData = JSON.parse(decoded);
      return {
        isValid: !!authData.token,
        model: authData.model || null,
        token: authData.token || null,
      };
    } catch (e) {
      return { isValid: false, model: null, token: null };
    }
  }
  return { isValid: false, model: null, token: null };
}

// Invalidate auth cache and notify listeners
function invalidateAuthCache() {
  const oldModel = authStoreCache?.model;
  authStoreCache = null;
  authStoreCacheTime = 0;
  
  // Notify listeners of change
  if (authChangeListeners.size > 0) {
    // Get new auth state
    getAuthStoreAsync().then(newStore => {
      if (oldModel !== newStore?.model) {
        authChangeListeners.forEach(callback => {
          try {
            callback(newStore?.token, newStore?.model);
          } catch (e) {
            console.error('Error in auth change listener:', e);
          }
        });
      }
    });
  }
}

// ==================== POCKETBASE CLIENT (for backward compatibility) ====================

export function getPocketBase() {
  // Return a mock object that uses the API proxy
  return {
    collection: (name) => ({
      getFullList: async (options = {}) => {
        return apiRequest('getFullList', {
          collection: name,
          filter: options.filter,
          sort: options.sort,
          expand: options.expand,
        });
      },
      getOne: async (id, options = {}) => {
        return apiRequest('getOne', {
          collection: name,
          recordId: id,
          expand: options.expand,
        });
      },
      getList: async (page = 1, perPage = 30, options = {}) => {
        return apiRequest('getList', {
          collection: name,
          page,
          perPage,
          filter: options.filter,
          sort: options.sort,
          expand: options.expand,
        });
      },
      create: async (data) => {
        return apiRequest('create', {
          collection: name,
          data,
        });
      },
      update: async (id, data) => {
        return apiRequest('update', {
          collection: name,
          recordId: id,
          data,
        });
      },
      delete: async (id) => {
        return apiRequest('delete', {
          collection: name,
          recordId: id,
        });
      },
      authWithPassword: async (email, password) => {
        invalidateAuthCache();
        const result = await apiRequest('authWithPassword', {
          collection: name,
          email,
          password,
        });
        // Refresh auth cache after login
        const newStore = await getAuthStoreAsync();
        // Notify listeners
        if (newStore?.model) {
          authChangeListeners.forEach(callback => {
            try {
              callback(newStore?.token, newStore?.model);
            } catch (e) {
              console.error('Error in auth change listener:', e);
            }
          });
        }
        return result;
      },
    }),
    admins: {
      authWithPassword: async (email, password) => {
        invalidateAuthCache();
        const result = await apiRequest('authWithPassword', {
          collection: '_superusers',
          email,
          password,
        });
        // Refresh auth cache after login
        const newStore = await getAuthStoreAsync();
        // Notify listeners
        if (newStore?.model) {
          authChangeListeners.forEach(callback => {
            try {
              callback(newStore?.token, newStore?.model);
            } catch (e) {
              console.error('Error in auth change listener:', e);
            }
          });
        }
        return result;
      },
      authRefresh: async () => {
        invalidateAuthCache();
        const result = await apiRequest('authRefresh', {
          collection: '_superusers',
        });
        // Refresh auth cache after refresh
        await getAuthStoreAsync();
        return result;
      },
    },
    authStore: {
      get isValid() {
        const store = getAuthStore();
        return store?.isValid || false;
      },
      get model() {
        const store = getAuthStore();
        return store?.model || null;
      },
      get token() {
        const store = getAuthStore();
        return store?.token || null;
      },
      clear: async () => {
        const oldModel = authStoreCache?.model;
        await apiRequest('clearAuth');
        invalidateAuthCache();
        // Clear cookie on client side
        if (typeof window !== 'undefined') {
          document.cookie = 'pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        // Notify listeners
        if (oldModel) {
          authChangeListeners.forEach(callback => {
            try {
              callback(null, null);
            } catch (e) {
              console.error('Error in auth change listener:', e);
            }
          });
        }
      },
      loadFromCookie: (cookie) => {
        // No-op, handled by server
      },
      exportToCookie: () => {
        // No-op, handled by server
      },
      onChange: (callback) => {
        if (typeof callback === 'function') {
          authChangeListeners.add(callback);
          // Return unsubscribe function
          return () => {
            authChangeListeners.delete(callback);
          };
        }
      },
    },
  };
}

// ==================== DRAWS ====================

export async function getAllDraws() {
  try {
    const records = await apiRequest('getFullList', {
      collection: 'draws',
      filter: 'status = "active"',
      sort: '-created',
    });
    return records;
  } catch (error) {
    console.error('Error fetching draws:', error?.message || error);
    return [];
  }
}

export async function getAllDrawsAdmin() {
  try {
    const records = await apiRequest('getFullList', {
      collection: 'draws',
      sort: '-created',
    });
    return records;
  } catch (error) {
    console.error('Error fetching draws:', error?.message || error);
    return [];
  }
}

export async function getDrawById(id) {
  try {
    const record = await apiRequest('getOne', {
      collection: 'draws',
      recordId: id,
    });
    return record;
  } catch (error) {
    console.error('Error fetching draw:', error?.message || error);
    return null;
  }
}

export async function createDraw(data) {
  const record = await apiRequest('create', {
    collection: 'draws',
    data: {
      title: data.title,
      description: data.description || '',
      image_url: data.image_url || '',
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      status: data.status || 'draft',
      entry_fee: data.entry_fee || 0,
    },
  });
  return record;
}

export async function updateDraw(id, data) {
  const record = await apiRequest('update', {
    collection: 'draws',
    recordId: id,
    data,
  });
  return record;
}

export async function deleteDraw(id) {
  await apiRequest('delete', {
    collection: 'draws',
    recordId: id,
  });
  return true;
}

// ==================== PRODUCTS ====================

export async function getProductsByDrawId(drawId) {
  try {
    const records = await apiRequest('getFullList', {
      collection: 'products',
      filter: `draw_id = "${drawId}"`,
      sort: '-created',
    });
    return records;
  } catch (error) {
    console.error('Error fetching products:', error?.message || error);
    return [];
  }
}

export async function createProduct(data) {
  const record = await apiRequest('create', {
    collection: 'products',
    data: {
      draw_id: data.draw_id,
      name: data.name,
      description: data.description || '',
      image_url: data.image_url || '',
    },
  });
  return record;
}

export async function updateProduct(id, data) {
  const record = await apiRequest('update', {
    collection: 'products',
    recordId: id,
    data,
  });
  return record;
}

export async function deleteProduct(id) {
  await apiRequest('delete', {
    collection: 'products',
    recordId: id,
  });
  return true;
}

// ==================== SUBMISSIONS ====================

export async function getSubmissionsByDrawId(drawId) {
  try {
    const records = await apiRequest('getFullList', {
      collection: 'submissions',
      filter: `draw_id = "${drawId}"`,
      sort: '-created',
    });
    return records;
  } catch (error) {
    console.error('Error fetching submissions:', error?.message || error);
    return [];
  }
}

export async function getAllSubmissions() {
  try {
    const records = await apiRequest('getFullList', {
      collection: 'submissions',
      sort: '-created',
      expand: 'draw_id',
    });
    return records;
  } catch (error) {
    console.error('Error fetching submissions:', error?.message || error);
    return [];
  }
}

export async function createSubmission(data) {
  const record = await apiRequest('create', {
    collection: 'submissions',
    data: {
      draw_id: data.draw_id,
      user_name: data.first_name || '',
      user_lastname: data.last_name || '',
      phone: data.phone || '',
      status: 'pending',
    },
  });
  return record;
}

export async function updateSubmissionStatus(id, status) {
  const record = await apiRequest('update', {
    collection: 'submissions',
    recordId: id,
    data: { status },
  });
  return record;
}

// ==================== ADMIN AUTH ====================

export async function adminLogin(email, password) {
  invalidateAuthCache();
  // Try the newer _superusers collection first (PocketBase v0.20+)
  try {
    const authData = await apiRequest('authWithPassword', {
      collection: '_superusers',
      email,
      password,
    });
    // Refresh auth cache after login
    await getAuthStoreAsync();
    return authData;
  } catch (e) {
    // Fall back to the old admins API for older PocketBase versions
    try {
      const authData = await apiRequest('authWithPassword', {
        collection: '_superusers',
        email,
        password,
      });
      // Refresh auth cache after login
      await getAuthStoreAsync();
      return authData;
    } catch (error) {
      console.error('Admin login error:', error?.message || error);
      throw error;
    }
  }
}

export async function adminLogout() {
  await apiRequest('clearAuth');
  invalidateAuthCache();
  // Clear cookie on client side
  if (typeof window !== 'undefined') {
    document.cookie = 'pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}

export function isAdminAuthenticated() {
  const store = getAuthStore();
  return store?.isValid && store?.model !== null;
}

export function getAdminAuthStore() {
  return getAuthStore();
}
