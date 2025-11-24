import {
  residenceService,
  lotService,
  clientService,
  reservationService,
  vendeurService,
  lotLMNPService,
  acquereurService,
  notaireService,
  partenaireService,
  residenceGestionService,
  contactResidenceService,
  dossierVenteService,
  optionLotService,
  profileService,
  gestionnaireService
} from './supabaseService';

export const Residence = residenceService;
export const Lot = lotService;
export const Client = clientService;
export const Reservation = reservationService;
export const Vendeur = vendeurService;
export const LotLMNP = lotLMNPService;
export const Acquereur = acquereurService;
export const Notaire = notaireService;
export const NotaireProgramme = notaireService;
export const Partenaire = partenaireService;
export const ResidenceGestion = residenceGestionService;
export const ContactResidence = contactResidenceService;
export const DossierVente = dossierVenteService;
export const OptionLot = optionLotService;
export const Profile = profileService;
export const User = profileService;
export const Gestionnaire = gestionnaireService;
