import { supabase } from '@/lib/supabase';

export class SupabaseService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async list(orderBy) {
    let query = supabase.from(this.tableName).select('*');

    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const field = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(field, { ascending: !isDesc });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async filter(where = {}) {
    let query = supabase.from(this.tableName).select('*');

    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findMany(options = {}) {
    let query = supabase.from(this.tableName).select('*');

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.orderBy) {
      const { field, direction = 'asc' } = options.orderBy;
      query = query.order(field, { ascending: direction === 'asc' });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findOne(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update(id, data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  async count(where = {}) {
    let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });

    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}

export const residenceService = new SupabaseService('residences');
export const lotService = new SupabaseService('lots');
export const clientService = new SupabaseService('clients');
export const reservationService = new SupabaseService('reservations');
export const vendeurService = new SupabaseService('vendeurs');
export const lotLMNPService = new SupabaseService('lots_lmnp');
export const acquereurService = new SupabaseService('acquereurs');
export const notaireService = new SupabaseService('notaires');
export const partenaireService = new SupabaseService('partenaires');
export const residenceGestionService = new SupabaseService('residences_gestion');
export const contactResidenceService = new SupabaseService('contacts_residence');
export const dossierVenteService = new SupabaseService('dossiers_vente');
export const optionLotService = new SupabaseService('options_lot');
export const profileService = new SupabaseService('profiles');
