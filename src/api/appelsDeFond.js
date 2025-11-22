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
        statut: 'valide',
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

  async devaliderParAdmin(id) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .update({
        statut: 'en_attente',
        date_validation_admin: null,
        valide_par: null
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
      { etape: 'Signature du contrat de réservation', sous_titre: 'OFFICIALISATION DE LA RÉSERVATION DE VOTRE LOGEMENT', ordre: 1 },
      { etape: 'Offre de prêt signée', sous_titre: 'VALIDATION DU FINANCEMENT', ordre: 2 },
      { etape: 'Signature de l\'acte authentique', sous_titre: 'Rendez-vous chez le notaire', ordre: 3 },
      { etape: 'Démarrage des travaux', sous_titre: 'Curage, sécurisation, démontage installations existantes.', ordre: 4 },
      { etape: 'Gros œuvre / Structure', sous_titre: 'Réfection ou consolidation des planchers, murs porteurs, charpente.', ordre: 5 },
      { etape: 'Second œuvre', sous_titre: 'Remplacement menuiseries extérieures, Cloisons, isolation, faux-plafonds, Électricité, plomberie, chauffage', ordre: 6 },
      { etape: 'Finitions intérieures', sous_titre: 'Sols, murs, peintures, Équipements sanitaires, cuisine, ventilation', ordre: 7 },
      { etape: 'Réception des travaux', sous_titre: 'Visite avec maître d\'œuvre, levée des réserves.', ordre: 8 },
      { etape: 'Livraison', sous_titre: 'Remise des clés, dossier technique, garanties.', ordre: 9 },
      { etape: 'Mise en location', sous_titre: 'Nettoyage pro, Reportage photo', ordre: 10 }
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
  },

  async initStepsForLot(lotId, acquereurId) {
    const { error } = await supabase.rpc('init_appels_de_fond_for_lot', {
      p_lot_id: lotId,
      p_acquereur_id: acquereurId
    });
    if (error) throw error;
  }
};
