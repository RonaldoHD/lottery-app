import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://pocketbase-j884wkkkcwws8s8sk8wc0kw0.72.61.197.220.sslip.io/';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse JSON body - handle empty body case
  let body = {};
  try {
    if (req.body) {
      body = typeof req.body === 'string' 
        ? (req.body.trim() ? JSON.parse(req.body) : {})
        : req.body;
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body', details: e.message });
  }

  // Validate required fields
  if (!body || typeof body !== 'object' || !body.operation) {
    return res.status(400).json({ 
      error: 'Missing required field: operation',
      received: body 
    });
  }

  const { operation, collection, recordId, ...params } = body;
  
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
        if (collection === '_superusers' || !collection) {
          // Use admins API for admin authentication (PocketBase standard)
          try {
            result = await pb.admins.authWithPassword(
              params.email || params.identity,
              params.password
            );
          } catch (adminError) {
            console.error('Admin auth error (admins API):', adminError);
            // Try collection method as fallback for older PocketBase versions
            try {
              result = await pb.collection('_superusers').authWithPassword(
                params.email || params.identity,
                params.password
              );
            } catch (collectionError) {
              console.error('Admin auth error (collection API):', collectionError);
              throw adminError; // Throw the original error
            }
          }
        } else {
          result = await pb.collection(collection).authWithPassword(
            params.email || params.identity,
            params.password
          );
        }
        break;

      case 'authRefresh':
        if (collection === '_superusers') {
          try {
            result = await pb.admins.authRefresh();
          } catch (e) {
            // Fallback to collection method
            result = await pb.collection('_superusers').authRefresh();
          }
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

    // Export auth cookie in response with secure settings
    if (pb.authStore.isValid && pb.authStore.token) {
      // Get the cookie value from PocketBase
      const cookieValue = pb.authStore.exportToCookie({ httpOnly: false });
      if (cookieValue) {
        // Extract just the cookie name and value (before first semicolon)
        const cookieNameValue = cookieValue.split(';')[0];
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Build secure cookie string
        let secureCookie = cookieNameValue;
        secureCookie += '; Path=/';
        secureCookie += '; SameSite=Strict';
        if (isProduction) {
          secureCookie += '; Secure';
        }
        secureCookie += '; HttpOnly';
        // Set max age (30 days)
        secureCookie += '; Max-Age=2592000';
        
        res.setHeader('Set-Cookie', secureCookie);
      }
    } else if (operation === 'clearAuth') {
      // Clear the cookie
      const isProduction = process.env.NODE_ENV === 'production';
      let clearCookie = 'pb_auth=';
      clearCookie += '; Path=/';
      clearCookie += '; SameSite=Strict';
      if (isProduction) {
        clearCookie += '; Secure';
      }
      clearCookie += '; HttpOnly';
      clearCookie += '; Max-Age=0';
      clearCookie += '; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      res.setHeader('Set-Cookie', clearCookie);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Proxy error:', error);
    const statusCode = error?.status || error?.response?.status || 500;
    const errorMessage = error?.message || error?.response?.message || 'Internal server error';
    const errorData = error?.data || error?.response?.data || {};
    
    res.status(statusCode).json({
      error: errorMessage,
      data: errorData,
    });
  }
}
