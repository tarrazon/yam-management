import { supabase } from '@/lib/supabase';

export const faqService = {
  async listActive() {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('actif', true)
      .order('categorie', { ascending: true })
      .order('ordre', { ascending: true });
    if (error) throw error;
    return data;
  },

  async listAll() {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .order('categorie', { ascending: true })
      .order('ordre', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(faqData) {
    const { data, error } = await supabase
      .from('faq')
      .insert(faqData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('faq')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
