import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useDocumentsManquants(lot) {
  const { data: acquereur } = useQuery({
    queryKey: ['acquereur', lot.acquereur_id],
    queryFn: async () => {
      if (!lot.acquereur_id) return null;
      const result = await base44.entities.Acquereur.findOne(lot.acquereur_id);
      return result;
    },
    enabled: !!lot.acquereur_id,
  });

  const { data: vendeur } = useQuery({
    queryKey: ['vendeur', lot.vendeur_id],
    queryFn: async () => {
      if (!lot.vendeur_id) return null;
      const result = await base44.entities.Vendeur.findOne(lot.vendeur_id);
      return result;
    },
    enabled: !!lot.vendeur_id,
  });

  const getDocumentsManquants = (entity, type) => {
    if (!entity) return [];
    const manquants = [];

    if (type === 'acquereur') {
      const docs = entity.documents || {};
      if (!docs.cni && !docs.passeport) manquants.push("Pièce d'identité (CNI ou Passeport)");
      if (!docs.lettre_intention_achat) manquants.push("Lettre d'intention d'achat");
      if (!docs.mandat_gestion) manquants.push("Mandat de gestion");
      if (!docs.mandat_acquereur_honoraires) manquants.push("Mandat acquéreur pour honoraires");
    } else if (type === 'vendeur') {
      if (entity.type_vendeur === 'entreprise') {
        const docsEntreprise = entity.documents_entreprise || {};
        if (!docsEntreprise.kbis) manquants.push("KBIS");
        if (!docsEntreprise.statuts) manquants.push("Statuts de la société");
        if (!docsEntreprise.pv_ag) manquants.push("PV AG autorisant la vente");
        if (!docsEntreprise.rib) manquants.push("RIB");
        if (!docsEntreprise.titre_propriete) manquants.push("Titre de propriété");
        if (!docsEntreprise.diagnostic) manquants.push("Diagnostic");
        if (!docsEntreprise.certificat_mesurage) manquants.push("Certificat de mesurage");
        if (!docsEntreprise.bail_commercial) manquants.push("Bail commercial");
        if (!docsEntreprise.convention_signee) manquants.push("Convention signée");
      } else if (entity.type_vendeur === 'particulier') {
        const docsParticulier = entity.documents_particulier || {};
        if (!docsParticulier.cni) manquants.push("CNI");
        if (!docsParticulier.questionnaire_etat_civil) manquants.push("Questionnaire état civil");
        if (!docsParticulier.rib) manquants.push("RIB");
        if (!docsParticulier.titre_propriete) manquants.push("Titre de propriété");
        if (!docsParticulier.diagnostic) manquants.push("Diagnostic");
        if (!docsParticulier.certificat_mesurage) manquants.push("Certificat de mesurage");
        if (!docsParticulier.bail_commercial) manquants.push("Bail commercial");
        if (!docsParticulier.convention_signee) manquants.push("Convention signée");
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
