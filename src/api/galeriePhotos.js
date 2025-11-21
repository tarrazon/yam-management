import { supabase } from '@/lib/supabase';

export const galeriePhotosService = {
  async list(lotId) {
    const { data, error } = await supabase
      .from('galerie_photos')
      .select('*')
      .eq('lot_id', lotId)
      .order('ordre', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(photoData) {
    const { data, error } = await supabase
      .from('galerie_photos')
      .insert(photoData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('galerie_photos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('galerie_photos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
