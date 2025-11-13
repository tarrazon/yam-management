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

  // Si c'est déjà une URL complète, la retourner
  if (filePath.startsWith('http')) return filePath;

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }

  return data.signedUrl;
};
