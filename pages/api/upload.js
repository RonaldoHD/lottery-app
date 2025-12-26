import PocketBase from 'pocketbase';
import formidable from 'formidable';
import fs from 'fs';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://pocketbase-j884wkkkcwws8s8sk8wc0kw0.72.61.197.220.sslip.io';
const FILE_DOMAIN = process.env.NEXT_PUBLIC_FILE_DOMAIN || 'https://api.mycoolifyserver.online';

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB max (for PDFs)
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const uploadedFile = files.image?.[0] || files.image;
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file type (images or PDFs)
    const allowedTypes = ['image/', 'application/pdf'];
    const isValidType = allowedTypes.some(type => uploadedFile.mimetype?.startsWith(type));
    if (!isValidType) {
      return res.status(400).json({ error: 'File must be an image (jpg, png, etc.) or PDF' });
    }

    // Get optional parameters
    const collection = fields.collection?.[0] || fields.collection || 'uploads';
    const recordId = fields.recordId?.[0] || fields.recordId;

    // Create PocketBase instance
    const pb = new PocketBase(POCKETBASE_URL);

    // Load auth from cookie if present
    let isAdminAuthenticated = false;
    if (req.headers.cookie) {
      try {
        pb.authStore.loadFromCookie(req.headers.cookie);
        // Check if we have valid admin auth
        // Admin auth is valid if authStore.isValid is true
        // We can also check if it's admin by trying to access admin methods
        if (pb.authStore.isValid) {
          // Try to verify it's admin auth by checking if we can access admin methods
          try {
            // This will throw if not admin, or succeed if admin
            const adminRecord = pb.authStore.model;
            // If model exists and we have a token, assume it's valid
            if (adminRecord && pb.authStore.token) {
              isAdminAuthenticated = true;
            }
          } catch (e) {
            // Not admin auth, continue to try env vars
          }
        }
      } catch (e) {
        console.error('Error loading auth cookie:', e);
      }
    }

    // If not authenticated as admin, try to authenticate as admin using environment variables
    if (!isAdminAuthenticated) {
      const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
      const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
      
      if (adminEmail && adminPassword) {
        try {
          await pb.admins.authWithPassword(adminEmail, adminPassword);
          isAdminAuthenticated = true;
        } catch (authError) {
          console.error('Admin authentication failed:', authError);
          return res.status(401).json({
            error: 'Admin authentication required for uploads. Please log in as admin in the dashboard first, or configure POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD environment variables.',
          });
        }
      } else {
        return res.status(401).json({
          error: 'Admin authentication required. Please log in as admin in the dashboard first, or configure POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD environment variables.',
          hint: 'Make sure you are logged in to the admin dashboard before uploading images.',
        });
      }
    }

    // Generate appropriate file name based on file type
    const isPDF = uploadedFile.mimetype === 'application/pdf';
    const defaultExtension = isPDF ? '.pdf' : '.jpg';
    const defaultPrefix = isPDF ? 'ebook_content' : 'image';
    const fileName = uploadedFile.originalFilename || `${defaultPrefix}_${Date.now()}${defaultExtension}`;

    let result;
    let imageUrl;

    // Get collection ID from PocketBase (needed for correct file URL)
    let collectionId;
    try {
      const collectionInfo = await pb.collections.getOne(collection);
      collectionId = collectionInfo.id;
    } catch (e) {
      console.error('Error fetching collection info:', e);
      // Fallback: try to extract from filePath if available later
      collectionId = null;
    }

    // Read file and create File object for PocketBase SDK
    // PocketBase SDK works best with File/Blob objects (Node.js 18+)
    const filePath = uploadedFile.filepath;
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: uploadedFile.mimetype });
    const file = new File([blob], fileName, { type: uploadedFile.mimetype });

    // Check if we're updating an existing record or creating new
    if (recordId && collection !== 'uploads' && collection !== 'ebooks_content') {
      // Update existing record with new image
      result = await pb.collection(collection).update(recordId, { image: file });
      
      // Get the file URL from PocketBase and convert to custom domain
      if (result.image && result.id) {
        // Extract filename from result.image
        let filename = result.image;
        let extractedCollectionId = null;
        
        // If result.image is a full URL, try to extract collection ID from it
        if (filename.includes('/api/files/')) {
          const parts = filename.split('/api/files/')[1]?.split('/');
          if (parts && parts.length >= 1) {
            extractedCollectionId = parts[0];
            filename = parts[parts.length - 1];
          }
        } else if (filename.includes('/')) {
          filename = filename.split('/').pop();
        }
        filename = filename.split('?')[0];
        
        // Use extracted collection ID if available, otherwise fetch it
        if (extractedCollectionId) {
          collectionId = extractedCollectionId;
        } else if (!collectionId) {
          try {
            const collectionInfo = await pb.collections.getOne(collection);
            collectionId = collectionInfo.id;
          } catch (e) {
            console.error('Error fetching collection ID for update:', e);
          }
        }
        // Construct URL with custom domain using collection ID
        // Format: {domain}/api/files/{collectionId}/{recordId}/{filename} (no field name in path)
        const urlCollection = collectionId || collection;
        imageUrl = `${FILE_DOMAIN}/api/files/${urlCollection}/${result.id}/${filename}`;
      }
    } else {
      // Create a new record in the specified collection
      // Use plain object with File - PocketBase SDK handles this correctly
      try {
        // Ensure we're authenticated as admin before creating
        if (!pb.authStore.isValid) {
          return res.status(401).json({
            error: 'Admin authentication required. Please log in as admin first.',
          });
        }

        // Create data object based on collection type
        const data = collection === 'ebooks_content' 
          ? { content: file }  // For ebooks_content, use 'content' field
          : { file, name: fileName }; // For uploads, use 'file' and 'name'

        result = await pb.collection(collection).create(data);
        
        // Get the file URL from PocketBase and convert to custom domain
        // For ebooks_content, the field is 'content'; for uploads, it's 'file' or 'image'
        let filePath = null;
        let fileField = null;
        
        if (collection === 'ebooks_content') {
          if (result.content) {
            fileField = 'content';
            filePath = result.content;
          }
        } else {
          // Check all possible file field names for uploads collection
          if (result.file) {
            fileField = 'file';
            filePath = result.file;
          } else if (result.image) {
            fileField = 'image';
            filePath = result.image;
          } else {
            // Try to find any file field
            const fileFields = Object.keys(result).filter(key => 
              typeof result[key] === 'string' && result[key].includes('/api/files/')
            );
            if (fileFields.length > 0) {
              fileField = fileFields[0];
              filePath = result[fileFields[0]];
            }
          }
        }
        console.log("Hello")
        // Construct URL with custom domain
        if (filePath && result.id) {
          // Extract filename from filePath (it might be a full URL or just the filename)
          let filename = filePath;
          let extractedCollectionId = null;
          
          // If filePath is a full URL, try to extract collection ID from it
          // Format: /api/files/{collectionId}/{recordId}/{field}/{filename}
          if (filePath.includes('/api/files/')) {
            const parts = filePath.split('/api/files/')[1]?.split('/');
            if (parts && parts.length >= 1) {
              extractedCollectionId = parts[0]; // First part after /api/files/ is collection ID
              filename = parts[parts.length - 1]; // Last part is filename
            }
          } else if (filePath.includes('/')) {
            // If it's just a path, extract the filename
            filename = filePath.split('/').pop();
          }
          
          // Remove query parameters if present
          filename = filename.split('?')[0];
          
          // Use extracted collection ID if available, otherwise fetch it
          if (extractedCollectionId) {
            collectionId = extractedCollectionId;
          } else if (!collectionId) {
            try {
              const collectionInfo = await pb.collections.getOne(collection);
              collectionId = collectionInfo.id;
            } catch (e) {
              console.error('Error fetching collection ID:', e);
            }
          }
          
          // Construct URL with custom domain using collection ID: {domain}/api/files/{collectionId}/{recordId}/{filename} (no field name in path)
          const urlCollection = collectionId || collection;
          imageUrl = `${FILE_DOMAIN}/api/files/${urlCollection}/${result.id}/${filename}`;
        } else if (result.id) {
          // Fallback: construct URL manually if we have the record ID but no file path
          fileField = collection === 'ebooks_content' ? 'content' : (result.file || result.image || 'file');
          // Use the fileName variable that was set earlier, or construct from result
          const fallbackFileName = result.name || fileName || `${fileField}_${result.id}`;
          
          // Ensure we have collection ID
          if (!collectionId) {
            try {
              const collectionInfo = await pb.collections.getOne(collection);
              collectionId = collectionInfo.id;
            } catch (e) {
              console.error('Error fetching collection ID for fallback:', e);
            }
          }
          
          const urlCollection = collectionId || collection;
          imageUrl = `${FILE_DOMAIN}/api/files/${urlCollection}/${result.id}/${fallbackFileName}`;
        }
      } catch (error) {
        console.error('Upload collection error:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          data: error.data,
          response: error.response,
        });
        
        // Handle 503 Service Unavailable (server error)
        if (error.status === 503) {
          return res.status(503).json({
            error: 'PocketBase server error. The server may be temporarily unavailable or the file might be too large.',
            details: error.message || 'Service temporarily unavailable',
            suggestion: 'Try again in a moment, or check if the file size is within limits (50MB for PDFs, 10MB for images).',
          });
        }
        
        // If collection doesn't exist, provide helpful error
        if (error.status === 404 || error.message?.includes(collection)) {
          const collectionName = collection === 'ebooks_content' ? 'ebooks_content' : 'uploads';
          const fieldInfo = collection === 'ebooks_content' 
            ? 'content (file type, max 50MB, allowed: application/pdf)'
            : 'name (text) and file (file type, max 10MB, allowed: image/*)';
          return res.status(400).json({
            error: `The "${collectionName}" collection does not exist in PocketBase. Please create it first.`,
            instructions: `Go to PocketBase admin, create a collection named "${collectionName}" with fields: ${fieldInfo}`
          });
        }
        // If permission denied, provide helpful error
        if (error.status === 403 || error.status === 401) {
          return res.status(403).json({
            error: 'Permission denied. Admin authentication required to upload files.',
            details: error.message || 'Please ensure you are logged in as admin.',
          });
        }
        throw error;
      }
    }

    // Clean up temp file
    try {
      fs.unlinkSync(uploadedFile.filepath);
    } catch (e) {
      // Ignore cleanup errors
    }

    res.status(200).json({
      success: true,
      imageUrl, // Keep for backward compatibility
      fileUrl: imageUrl, // More generic name
      result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error.message || 'Upload failed',
      details: error.data || null,
    });
  }
}
