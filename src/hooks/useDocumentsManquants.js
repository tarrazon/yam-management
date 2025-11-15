import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useDocumentsManquants(lot) {
  const { data: acquereur } = useQuery({
    queryKey: ['acquereur', lot.acquereur_id],
    queryFn: async () => {
      if (!lot.acquereur_id) return null;
      const result = await base44.entities.Acquereur.findOne({ id: lot.acquereur_id });
      return result;
    },
    enabled: !!lot.acquereur_id,
  });

  const { data: vendeur } = useQuery({
    queryKey: ['vendeur', lot.vendeur_id],
    queryFn: async () => {
      if (!lot.vendeur_id) return null;
      const result = await base44.entities.Vendeur.findOne({ id: lot.vendeur_id });
      return result;
    },
    enabled: !!lot.vendeur_id,
  });

  const getDocumentsManquants = (entity, type) => {
    if (!entity) return [];
    const manquants = [];

    if (type === 'acquereur') {
      const docs = entity.documents || {};
      if (!docs.carte_identite && !docs.passeport) manquants.push("Justificatif d'identité");
      if (!docs.justificatif_domicile) manquants.push("Justificatif de domicile");
      if (!docs.avis_imposition) manquants.push("Avis d'imposition");
      if (!docs.justificatifs_revenus) manquants.push("Justificatifs de revenus");
      if (!docs.attestation_assurance) manquants.push("Attestation d'assurance");
    } else if (type === 'vendeur') {
      if (entity.type_vendeur === 'entreprise') {
        const docsEntreprise = entity.documents_entreprise || {};
        if (!docsEntreprise.kbis) manquants.push("KBIS");
        if (!docsEntreprise.statuts) manquants.push("Statuts");
      } else if (entity.type_vendeur === 'particulier') {
        const docsParticulier = entity.documents_particulier || {};
        if (!docsParticulier.carte_identite && !docsParticulier.passeport) {
          manquants.push("Justificatif d'identité");
        }
      }
    }

    return manquants;
  };

  const documentsManquantsAcquereur = acquereur ? getDocumentsManquants(acquereur, 'acquereur') : [];
  const documentsManquantsVendeur = vendeur ? getDocumentsManquants(vendeur, 'vendeur') : [];

  const totalManquants = documentsManquantsAcquereur.length + documentsManquantsVendeur.length;

  return {
    acquereur,
    vendeur,
    documentsManquantsAcquereur,
    documentsManquantsVendeur,
    totalManquants,
    hasDocumentsManquants: totalManquants > 0,
  };
}
