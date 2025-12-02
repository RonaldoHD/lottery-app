import PocketBase from 'pocketbase';

// PocketBase instance - configure your URL here
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Create a singleton PocketBase instance
let pb = null;

export function getPocketBase() {
  if (typeof window === 'undefined') {
    // Server-side: create new instance each time
    return new PocketBase(POCKETBASE_URL);
  }
  
  // Client-side: use singleton
  if (!pb) {
    pb = new PocketBase(POCKETBASE_URL);
    
    // Load auth from cookie if exists
    try {
      pb.authStore.loadFromCookie(document.cookie);
    } catch (e) {
      // Ignore cookie loading errors
    }
    
    // Update cookie on auth change
    pb.authStore.onChange(() => {
      try {
        document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
      } catch (e) {
        // Ignore cookie saving errors
      }
    });
  }
  
  return pb;
}

// ==================== DRAWS ====================

export async function getAllDraws() {
  try {
    const client = getPocketBase();
    const records = await client.collection('draws').getFullList({
      sort: '-created',
      filter: 'status = "active"',
    });
    return records;
  } catch (error) {
    console.error('Error fetching draws:', error?.message || error);
    return [];
  }
}

export async function getAllDrawsAdmin() {
  try {
    const client = getPocketBase();
    const records = await client.collection('draws').getFullList({
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
    const client = getPocketBase();
    const record = await client.collection('draws').getOne(id);
    return record;
  } catch (error) {
    console.error('Error fetching draw:', error?.message || error);
    return null;
  }
}

export async function createDraw(data) {
  const client = getPocketBase();
  const record = await client.collection('draws').create({
    title: data.title,
    description: data.description || '',
    image_url: data.image_url || '',
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    status: data.status || 'draft',
    entry_fee: data.entry_fee || 0,
  });
  return record;
}

export async function updateDraw(id, data) {
  const client = getPocketBase();
  const record = await client.collection('draws').update(id, data);
  return record;
}

export async function deleteDraw(id) {
  const client = getPocketBase();
  await client.collection('draws').delete(id);
  return true;
}

// ==================== PRODUCTS ====================

export async function getProductsByDrawId(drawId) {
  try {
    const client = getPocketBase();
    const records = await client.collection('products').getFullList({
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
  const client = getPocketBase();
  const record = await client.collection('products').create({
    draw_id: data.draw_id,
    name: data.name,
    description: data.description || '',
    image_url: data.image_url || '',
    retail_price: data.retail_price || 0,
    specifications: data.specifications || [],
    features: data.features || [],
  });
  return record;
}

export async function updateProduct(id, data) {
  const client = getPocketBase();
  const record = await client.collection('products').update(id, data);
  return record;
}

export async function deleteProduct(id) {
  const client = getPocketBase();
  await client.collection('products').delete(id);
  return true;
}

// ==================== SUBMISSIONS ====================

export async function getSubmissionsByDrawId(drawId) {
  try {
    const client = getPocketBase();
    const records = await client.collection('submissions').getFullList({
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
    const client = getPocketBase();
    const records = await client.collection('submissions').getFullList({
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
  const client = getPocketBase();
  const record = await client.collection('submissions').create({
    draw_id: data.draw_id,
    user_email: data.user_email,
    user_name: data.user_name || '',
    status: 'pending',
  });
  return record;
}

export async function updateSubmissionStatus(id, status) {
  const client = getPocketBase();
  const record = await client.collection('submissions').update(id, { status });
  return record;
}

// ==================== ADMIN AUTH ====================

export async function adminLogin(email, password) {
  const client = getPocketBase();
  // Try the newer _superusers collection first (PocketBase v0.20+)
  try {
    const authData = await client.collection('_superusers').authWithPassword(email, password);
    return authData;
  } catch (e) {
    // Fall back to the old admins API for older PocketBase versions
    try {
      const authData = await client.admins.authWithPassword(email, password);
      return authData;
    } catch (error) {
      console.error('Admin login error:', error?.message || error);
      throw error;
    }
  }
}

export function adminLogout() {
  const client = getPocketBase();
  client.authStore.clear();
}

export function isAdminAuthenticated() {
  const client = getPocketBase();
  return client.authStore.isValid && client.authStore.model !== null;
}

export function getAdminAuthStore() {
  const client = getPocketBase();
  return client.authStore;
}
