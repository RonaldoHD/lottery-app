import PocketBase from 'pocketbase';
import formidable from 'formidable';
import fs from 'fs';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://pocketbase-j884wkkkcwws8s8sk8wc0kw0.72.61.197.220.sslip.io';

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
      maxFileSize: 10 * 1024 * 1024, // 10MB max
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const uploadedFile = files.image?.[0] || files.image;
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get optional parameters
    const collection = fields.collection?.[0] || fields.collection || 'uploads';
    const recordId = fields.recordId?.[0] || fields.recordId;

    // Create PocketBase instance
    const pb = new PocketBase(POCKETBASE_URL);

    // Load auth from cookie if present
    if (req.headers.cookie) {
      try {
        pb.authStore.loadFromCookie(req.headers.cookie);
      } catch (e) {
        console.error('Error loading auth cookie:', e);
      }
    }

    // Read the file and create a File object for PocketBase
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const fileName = uploadedFile.originalFilename || `image_${Date.now()}.jpg`;
    const blob = new Blob([fileBuffer], { type: uploadedFile.mimetype });
    const file = new File([blob], fileName, { type: uploadedFile.mimetype });

    let result;
    let imageUrl;

    // Check if we're updating an existing record or creating new
    if (recordId && collection !== 'uploads') {
      // Update existing record with new image
      const formData = new FormData();
      formData.append('image', file);

      result = await pb.collection(collection).update(recordId, formData);
      
      // Get the file URL from PocketBase
      if (result.image) {
        imageUrl = pb.files.getUrl(result, result.image);
      }
    } else {
      // Create a new record in the uploads collection
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', fileName);

      try {
        result = await pb.collection('uploads').create(formData);
        
        // Get the file URL from PocketBase
        if (result.file) {
          imageUrl = pb.files.getUrl(result, result.file);
        }
      } catch (error) {
        // If uploads collection doesn't exist, provide helpful error
        if (error.status === 404 || error.message?.includes('uploads')) {
          return res.status(400).json({
            error: 'The "uploads" collection does not exist in PocketBase. Please create it first.',
            instructions: 'Go to PocketBase admin, create a collection named "uploads" with fields: name (text) and file (file type, max 10MB, allowed: image/*)'
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
      imageUrl,
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
