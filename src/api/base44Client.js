import { supabase } from '@/lib/supabase';
import * as entities from './entities';
import * as integrations from './integrations';

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
    Profile: entities.Profile,
    User: entities.User,
    Gestionnaire: entities.Gestionnaire,
  },
  integrations: {
    Core: integrations.Core,
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

      // Si c'est un partenaire, récupérer son partenaire_id
      if (profile?.role_custom === 'partenaire') {
        const { data: partenaire } = await supabase
          .from('partenaires')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (partenaire) {
          profile.partenaire_id = partenaire.id;
        }
      }

      return profile;
    },
    logout: async () => {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  }
};
