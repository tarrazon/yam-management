import { supabase } from '@/lib/supabase';

export const messagesPartenairesService = {
  async list(partenaireId) {
    const { data, error } = await supabase
      .from('messages_partenaires')
      .select('*')
      .eq('partenaire_id', partenaireId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(messageData) {
    const { data, error } = await supabase
      .from('messages_partenaires')
      .insert(messageData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async marquerLu(id) {
    const { data, error } = await supabase
      .from('messages_partenaires')
      .update({ lu: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async countNonLus(partenaireId) {
    const { count, error } = await supabase
      .from('messages_partenaires')
      .select('*', { count: 'exact', head: true })
      .eq('partenaire_id', partenaireId)
      .eq('lu', false)
      .eq('expediteur_type', 'admin');
    if (error) throw error;
    return count || 0;
  }
};
