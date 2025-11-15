import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useDocumentsManquants(lot) {
  const { data: acquereur } = useQuery({
    queryKey: ['acquereur', lot.acquereur_id],
    queryFn: () => lot.acquereur_id ? base44.entities.Acquereur.get(lot.acquereur_id) : null,
    enabled: !!lot.acquereur_id,
  });

  const { data: vendeur } = useQuery({
    queryKey: ['vendeur', lot.vendeur_id],
    queryFn: () => lot.vendeur_id ? base44.entities.Vendeur.get(lot.vendeur_id) : null,
    enabled: !!lot.vendeur_id,
  });

  const getDocumentsManquants = (entity, type) => {
    if (!entity) return [];
    const manquants = [];

    if (type === 'acquereur') {
      if (!entity.justificatif_identite) manquants.push("Justificatif d'identité");
      if (!entity.justificatif_domicile) manquants.push("Justificatif de domicile");
      if (!entity.derniers_avis_imposition) manquants.push("Derniers avis d'imposition");
      if (!entity.justificatifs_revenus) manquants.push("Justificatifs de revenus");
      if (!entity.attestation_assurance) manquants.push("Attestation d'assurance");
    } else if (type === 'vendeur') {
      if (!entity.documents_entreprise && entity.type_vendeur === 'entreprise') {
        manquants.push("Documents d'entreprise");
      }
      if (!entity.justificatif_identite && entity.type_vendeur === 'particulier') {
        manquants.push("Justificatif d'identité");
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
