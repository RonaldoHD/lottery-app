import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://pocketbase-j884wkkkcwws8s8sk8wc0kw0.72.61.197.220.sslip.io/';

export default async function handler(req, res) {
  // Optional catch-all route: handles both /api/pocketbase and /api/pocketbase/[...path]
  // For /api/pocketbase, path will be undefined
  const { path } = req.query;
  
  // Create PocketBase instance for server-side requests
  const pb = new PocketBase(POCKETBASE_URL);

  // Load auth from cookie if present
  if (req.headers.cookie) {
    try {
      pb.authStore.loadFromCookie(req.headers.cookie);
    } catch (e) {
      // Ignore cookie loading errors
    }
  }

  try {
    const { operation, collection, recordId, ...params } = req.body || {};
    let result;

    switch (operation) {
      case 'getFullList':
        result = await pb.collection(collection).getFullList({
          filter: params.filter,
          sort: params.sort,
          expand: params.expand,
        });
        break;

      case 'getOne':
        result = await pb.collection(collection).getOne(recordId, {
          expand: params.expand,
        });
        break;

      case 'getList':
        result = await pb.collection(collection).getList(
          params.page || 1,
          params.perPage || 30,
          {
            filter: params.filter,
            sort: params.sort,
            expand: params.expand,
          }
        );
        break;

      case 'create':
        result = await pb.collection(collection).create(params.data);
        break;

      case 'update':
        result = await pb.collection(collection).update(recordId, params.data);
        break;

      case 'delete':
        await pb.collection(collection).delete(recordId);
        result = { success: true };
        break;

      case 'authWithPassword':
        if (collection === '_superusers') {
          result = await pb.collection('_superusers').authWithPassword(
            params.email || params.identity,
            params.password
          );
        } else {
          result = await pb.collection(collection).authWithPassword(
            params.email || params.identity,
            params.password
          );
        }
        break;

      case 'authRefresh':
        if (collection === '_superusers') {
          result = await pb.collection('_superusers').authRefresh();
        } else {
          result = await pb.admins.authRefresh();
        }
        break;

      case 'getAuthStore':
        result = {
          isValid: pb.authStore.isValid,
          model: pb.authStore.model,
          token: pb.authStore.token,
        };
        break;

      case 'clearAuth':
        pb.authStore.clear();
        result = { success: true };
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    // Export auth cookie in response
    const authCookie = pb.authStore.exportToCookie({ httpOnly: false });
    if (authCookie) {
      res.setHeader('Set-Cookie', authCookie);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(error?.status || 500).json({
      error: error?.message || 'Internal server error',
      data: error?.data || {},
    });
  }
}
