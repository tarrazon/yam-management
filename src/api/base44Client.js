import { supabase } from '@/lib/supabase';
import * as entities from './entities';

export const base44 = {
  entities: {
    Residence: entities.Residence,
    Lot: entities.Lot,
    Client: entities.Client,
    Reservation: entities.Reservation,
    Vendeur: entities.Vendeur,
    LotLMNP: entities.LotLMNP,
    Acquereur: entities.Acquereur,
    Notaire: entities.Notaire,
    NotaireProgramme: entities.NotaireProgramme,
    Partenaire: entities.Partenaire,
    ResidenceGestion: entities.ResidenceGestion,
    ContactResidence: entities.ContactResidence,
    DossierVente: entities.DossierVente,
    OptionLot: entities.OptionLot,
  },
  auth: {
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return profile;
    },
    logout: async () => {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  }
};
