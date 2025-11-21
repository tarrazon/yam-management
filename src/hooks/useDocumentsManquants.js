import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function getDocumentsByWorkflowStep(stepCode, acquereur, vendeur) {
  const documents = {
    manquants: [],
    presents: [],
  };

  if (stepCode === 'relance_docs_vendeurs' && vendeur) {
    if (vendeur.type_vendeur === 'entreprise') {
      const docsEntreprise = vendeur.documents_entreprise || {};
      if (!docsEntreprise.kbis) documents.manquants.push({ label: "KBIS", field: "documents_entreprise.kbis" });
      else documents.presents.push({ label: "KBIS", field: "documents_entreprise.kbis" });

      if (!docsEntreprise.statuts) documents.manquants.push({ label: "Statuts de la société", field: "documents_entreprise.statuts" });
      else documents.presents.push({ label: "Statuts de la société", field: "documents_entreprise.statuts" });

      if (!docsEntreprise.pv_ag) documents.manquants.push({ label: "PV AG autorisant la vente", field: "documents_entreprise.pv_ag" });
      else documents.presents.push({ label: "PV AG autorisant la vente", field: "documents_entreprise.pv_ag" });

      if (!docsEntreprise.rib) documents.manquants.push({ label: "RIB", field: "documents_entreprise.rib" });
      else documents.presents.push({ label: "RIB", field: "documents_entreprise.rib" });

      if (!docsEntreprise.titre_propriete) documents.manquants.push({ label: "Titre de propriété", field: "documents_entreprise.titre_propriete" });
      else documents.presents.push({ label: "Titre de propriété", field: "documents_entreprise.titre_propriete" });

      if (!docsEntreprise.diagnostic) documents.manquants.push({ label: "Diagnostic", field: "documents_entreprise.diagnostic" });
      else documents.presents.push({ label: "Diagnostic", field: "documents_entreprise.diagnostic" });

      if (!docsEntreprise.certificat_mesurage) documents.manquants.push({ label: "Certificat de mesurage", field: "documents_entreprise.certificat_mesurage" });
      else documents.presents.push({ label: "Certificat de mesurage", field: "documents_entreprise.certificat_mesurage" });

      if (!docsEntreprise.bail_commercial) documents.manquants.push({ label: "Bail commercial", field: "documents_entreprise.bail_commercial" });
      else documents.presents.push({ label: "Bail commercial", field: "documents_entreprise.bail_commercial" });

      if (!docsEntreprise.convention_signee) documents.manquants.push({ label: "Convention signée", field: "documents_entreprise.convention_signee" });
      else documents.presents.push({ label: "Convention signée", field: "documents_entreprise.convention_signee" });
    } else if (vendeur.type_vendeur === 'particulier') {
      const docsParticulier = vendeur.documents_particulier || {};
      if (!docsParticulier.cni) documents.manquants.push({ label: "CNI", field: "documents_particulier.cni" });
      else documents.presents.push({ label: "CNI", field: "documents_particulier.cni" });

      if (!docsParticulier.questionnaire_etat_civil) documents.manquants.push({ label: "Questionnaire état civil", field: "documents_particulier.questionnaire_etat_civil" });
      else documents.presents.push({ label: "Questionnaire état civil", field: "documents_particulier.questionnaire_etat_civil" });

      if (!docsParticulier.rib) documents.manquants.push({ label: "RIB", field: "documents_particulier.rib" });
      else documents.presents.push({ label: "RIB", field: "documents_particulier.rib" });

      if (!docsParticulier.titre_propriete) documents.manquants.push({ label: "Titre de propriété", field: "documents_particulier.titre_propriete" });
      else documents.presents.push({ label: "Titre de propriété", field: "documents_particulier.titre_propriete" });

      if (!docsParticulier.diagnostic) documents.manquants.push({ label: "Diagnostic", field: "documents_particulier.diagnostic" });
      else documents.presents.push({ label: "Diagnostic", field: "documents_particulier.diagnostic" });

      if (!docsParticulier.certificat_mesurage) documents.manquants.push({ label: "Certificat de mesurage", field: "documents_particulier.certificat_mesurage" });
      else documents.presents.push({ label: "Certificat de mesurage", field: "documents_particulier.certificat_mesurage" });

      if (!docsParticulier.bail_commercial) documents.manquants.push({ label: "Bail commercial", field: "documents_particulier.bail_commercial" });
      else documents.presents.push({ label: "Bail commercial", field: "documents_particulier.bail_commercial" });

      if (!docsParticulier.convention_signee) documents.manquants.push({ label: "Convention signée", field: "documents_particulier.convention_signee" });
      else documents.presents.push({ label: "Convention signée", field: "documents_particulier.convention_signee" });
    }
  } else if (stepCode === 'reservation' && acquereur) {
    const docs = acquereur.documents || {};
    if (!docs.cni && !docs.passeport) documents.manquants.push({ label: "Pièce d'identité (CNI ou Passeport)", field: "documents.cni" });
    else documents.presents.push({ label: "Pièce d'identité", field: "documents.cni" });

    if (!docs.justificatif_domicile) documents.manquants.push({ label: "Justificatif de domicile", field: "documents.justificatif_domicile" });
    else documents.presents.push({ label: "Justificatif de domicile", field: "documents.justificatif_domicile" });

    if (!docs.lettre_intention_achat) documents.manquants.push({ label: "Lettre d'intention d'achat", field: "documents.lettre_intention_achat" });
    else documents.presents.push({ label: "Lettre d'intention d'achat", field: "documents.lettre_intention_achat" });

    if (!docs.mandat_gestion) documents.manquants.push({ label: "Mandat de gestion", field: "documents.mandat_gestion" });
    else documents.presents.push({ label: "Mandat de gestion", field: "documents.mandat_gestion" });

    if (!docs.mandat_acquereur_honoraires) documents.manquants.push({ label: "Mandat acquéreur pour honoraires", field: "documents.mandat_acquereur_honoraires" });
    else documents.presents.push({ label: "Mandat acquéreur pour honoraires", field: "documents.mandat_acquereur_honoraires" });
  }

  return documents;
}

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
      if (!docs.justificatif_domicile) manquants.push("Justificatif de domicile");
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
