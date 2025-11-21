import { supabase } from '@/lib/supabase';

export const messagesAdminService = {
  async list(acquereurId) {
    const { data, error } = await supabase
      .from('messages_admin')
      .select('*')
      .eq('acquereur_id', acquereurId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(messageData) {
    const { data, error } = await supabase
      .from('messages_admin')
      .insert(messageData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async marquerLu(id) {
    const { data, error } = await supabase
      .from('messages_admin')
      .update({ lu: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async countNonLus(acquereurId) {
    const { count, error } = await supabase
      .from('messages_admin')
      .select('*', { count: 'exact', head: true })
      .eq('acquereur_id', acquereurId)
      .eq('lu', false)
      .eq('expediteur_type', 'admin');
    if (error) throw error;
    return count || 0;
  }
};
