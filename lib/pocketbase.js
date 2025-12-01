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
    
    // Load auth from localStorage
    pb.authStore.loadFromCookie(document.cookie);
    
    // Update cookie on auth change
    pb.authStore.onChange(() => {
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
    });
  }
  
  return pb;
}

// ==================== DRAWS ====================

export async function getAllDraws() {
  const pb = getPocketBase();
  try {
    const records = await pb.collection('draws').getFullList({
      sort: '-created',
      filter: 'status = "active"',
    });
    return records;
  } catch (error) {
    console.error('Error fetching draws:', error);
    return [];
  }
}

export async function getAllDrawsAdmin() {
  const pb = getPocketBase();
  try {
    const records = await pb.collection('draws').getFullList({
      sort: '-created',
    });
    return records;
  } catch (error) {
    console.error('Error fetching draws:', error);
    return [];
  }
}

export async function getDrawById(id) {
  const pb = getPocketBase();
  try {
    const record = await pb.collection('draws').getOne(id);
    return record;
  } catch (error) {
    console.error('Error fetching draw:', error);
    return null;
  }
}

export async function createDraw(data) {
  const pb = getPocketBase();
  try {
    const record = await pb.collection('draws').create({
      title: data.title,
      description: data.description || '',
      image_url: data.image_url || '',
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      status: data.status || 'draft',
      entry_fee: data.entry_fee || 0,
    });
    return record;
  } catch (error) {
    console.error('Error creating draw:', error);
    throw error;
  }
}

export async function updateDraw(id, data) {
  const pb = getPocketBase();
  try {
    const record = await pb.collection('draws').update(id, data);
    return record;
  } catch (error) {
    console.error('Error updating draw:', error);
    throw error;
  }
}

export async function deleteDraw(id) {
  const pb = getPocketBase();
  try {
    await pb.collection('draws').delete(id);
    return true;
  } catch (error) {
    console.error('Error deleting draw:', error);
    throw error;
  }
}

// ==================== PRODUCTS ====================

export async function getProductsByDrawId(drawId) {
  const pb = getPocketBase();
  try {
    const records = await pb.collection('products').getFullList({
      filter: `draw_id = "${drawId}"`,
      sort: '-created',
    });
    return records;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function createProduct(data) {
  const pb = getPocketBase();
  try {
    const record = await pb.collection('products').create({
      draw_id: data.draw_id,
      name: data.name,
      description: data.description || '',
      image_url: data.image_url || '',
      retail_price: data.retail_price || 0,
      specifications: data.specifications || [],
      features: data.features || [],
    });
    return record;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(id, data) {
  const pb = getPocketBase();
  try {
    const record = await pb.collection('products').update(id, data);
    return record;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id) {
  const pb = getPocketBase();
  try {
    await pb.collection('products').delete(id);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// ==================== SUBMISSIONS ====================

export async function getSubmissionsByDrawId(drawId) {
  const pb = getPocketBase();
  try {
    const records = await pb.collection('submissions').getFullList({
      filter: `draw_id = "${drawId}"`,
      sort: '-created',
    });
    return records;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
}

export async function getAllSubmissions() {
  const pb = getPocketBase();
  try {
    const records = await pb.collection('submissions').getFullList({
      sort: '-created',
      expand: 'draw_id',
    });
    return records;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
}

export async function createSubmission(data) {
  const pb = getPocketBase();
  try {
    const record = await pb.collection('submissions').create({
      draw_id: data.draw_id,
      user_email: data.user_email,
      user_name: data.user_name || '',
      status: 'pending',
    });
    return record;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
}

export async function updateSubmissionStatus(id, status) {
  const pb = getPocketBase();
  try {
    const record = await pb.collection('submissions').update(id, { status });
    return record;
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
}

// ==================== ADMIN AUTH ====================

export async function adminLogin(email, password) {
  const pb = getPocketBase();
  try {
    const authData = await pb.admins.authWithPassword(email, password);
    return authData;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
}

export function adminLogout() {
  const pb = getPocketBase();
  pb.authStore.clear();
}

export function isAdminAuthenticated() {
  const pb = getPocketBase();
  return pb.authStore.isValid && pb.authStore.model?.admin;
}

export function getAdminAuthStore() {
  const pb = getPocketBase();
  return pb.authStore;
}


