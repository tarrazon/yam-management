import { supabase } from '@/lib/supabase';

export const uploadFile = async (file) => {
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Erreur lors de l'upload: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  return {
    file_url: publicUrl,
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
