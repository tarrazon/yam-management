import { supabase } from '@/lib/supabase';

export const uploadFile = async (file) => {
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  console.log('Upload - File info:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  // Vérifier l'authentification
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Upload - Session exists:', !!session);

  if (!session) {
    throw new Error('Vous devez être connecté pour uploader un fichier');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  console.log('Upload - Attempting upload to:', filePath);

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (error) {
    console.error('Upload error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error
    });
    throw new Error(`Erreur lors de l'upload: ${error.message}`);
  }

  console.log('Upload - Success, file path:', data.path);

  // Pour un bucket privé, on retourne le path
  // L'URL signée sera générée à la demande
  return {
    file_url: data.path,
    file_path: data.path
  };
};

export const deleteFile = async (filePath) => {
  const { error } = await supabase.storage
    .from('documents')
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Erreur lors de la suppression: ${error.message}`);
  }

  return { success: true };
};

export const getSignedUrl = async (filePath, expiresIn = 3600) => {
  if (!filePath) return null;

  console.log('[getSignedUrl] Input:', filePath);

  // Si c'est une URL externe (Pexels, etc.), la retourner telle quelle
  if (filePath.startsWith('http') && !filePath.includes('supabase.co')) {
    console.log('[getSignedUrl] External URL, returning as-is');
    return filePath;
  }

  // Si c'est une URL Supabase complète, extraire le chemin
  let actualPath = filePath;
  if (filePath.includes('supabase.co/storage/v1/object/public/documents/')) {
    actualPath = filePath.split('/public/documents/')[1];
    console.log('[getSignedUrl] Extracted path from full URL:', actualPath);
  }

  console.log('[getSignedUrl] Requesting signed URL for:', actualPath);

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(actualPath, expiresIn);

  if (error) {
    console.error('[getSignedUrl] Error creating signed URL:', error);
    return null;
  }

  console.log('[getSignedUrl] Signed URL created:', data.signedUrl);
  return data.signedUrl;
};
