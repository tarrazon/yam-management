import { supabase } from '@/lib/supabase';

export const appelsDeFondService = {
  async list(lotId) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .select('*')
      .eq('lot_id', lotId)
      .order('ordre', { ascending: true });
    if (error) throw error;
    return data;
  },

  async listByAcquereur(acquereurId) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .select('*')
      .eq('acquereur_id', acquereurId)
      .order('ordre', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(appelData) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .insert(appelData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async validerParAdmin(id, adminId, notes = '') {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .update({
        statut: 'valide_admin',
        date_validation_admin: new Date().toISOString(),
        valide_par: adminId,
        notes_admin: notes
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async marquerComplete(id) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .update({
        statut: 'complete',
        date_completion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('appels_de_fond')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async createDefaultSteps(lotId, acquereurId) {
    const defaultSteps = [
      { etape: 'Signature du contrat de réservation', description: 'Officialisation de la réservation de votre logement', ordre: 1 },
      { etape: 'Offre de prêt signée', description: 'Signature de votre offre de prêt bancaire', ordre: 2 },
      { etape: 'Signature de l\'acte authentique', description: 'Rendez-vous chez le notaire', ordre: 3 },
      { etape: 'Démarrage des travaux', description: 'Curage, sécurisation, démontage installations existantes', ordre: 4 },
      { etape: 'Gros oeuvre / Structure', description: 'Réfection ou consolidation des planchers, murs porteurs, charpente', ordre: 5 },
      { etape: 'Second oeuvre', description: 'Remplacement menuiseries extérieures, cloisons, isolation, faux-plafonds, électricité, plomberie, chauffage', ordre: 6 },
      { etape: 'Finitions intérieures', description: 'Sols, murs, peintures, équipements sanitaires, cuisine, ventilation', ordre: 7 },
      { etape: 'Réception des travaux', description: 'Visite avec maître d\'oeuvre, levée des réserves', ordre: 8 },
      { etape: 'Livraison', description: 'Remise des clés, dossier technique, garanties', ordre: 9 },
      { etape: 'Mise en location', description: 'Nettoyage pro, reportage photo', ordre: 10 }
    ];

    const steps = defaultSteps.map(step => ({
      ...step,
      lot_id: lotId,
      acquereur_id: acquereurId,
      statut: 'en_attente'
    }));

    const { data, error } = await supabase
      .from('appels_de_fond')
      .insert(steps)
      .select();

    if (error) throw error;
    return data;
  }
};
