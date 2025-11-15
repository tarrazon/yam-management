/**
 * Clean form data before submission
 * - Convert empty strings to null for numeric fields
 * - Convert empty strings to null for date fields
 * - Remove undefined values
 */
export function cleanFormData(data, numericFields = [], dateFields = []) {
  const cleaned = { ...data };

  // Clean numeric fields
  numericFields.forEach(field => {
    if (cleaned[field] === "" || cleaned[field] === undefined || cleaned[field] === null) {
      cleaned[field] = null;
    } else {
      cleaned[field] = Number(cleaned[field]);
    }
  });

  // Clean date fields - empty strings must become null
  dateFields.forEach(field => {
    if (cleaned[field] === "" || cleaned[field] === undefined) {
      cleaned[field] = null;
    }
  });

  return cleaned;
}

/**
 * Get all date field names from formData
 */
export function getDateFields(formData) {
  return Object.keys(formData).filter(key =>
    key.startsWith('date_') || key.endsWith('_date') || key === 'date'
  );
}

/**
 * Get all numeric field names that should be cleaned
 */
export function getNumericFields(formData) {
  const numericFieldNames = [
    'surface', 'prix', 'prix_net_vendeur', 'honoraires', 'tva_honoraires',
    'pourcentage_honoraires', 'honoraires_acquereur_ht', 'tva_honoraires_acquereur',
    'prix_fai', 'rentabilite', 'loyer_mensuel', 'etage', 'nombre_lots',
    'capacite_financement', 'apport_initial', 'commission_gestion',
    'taux_retrocession', 'volume_annuel_attendu', 'commission_taux',
    'latitude', 'longitude', 'budget_min', 'budget_max', 'budget', 'apport',
    'endettement_estime', 'revenus_mensuels'
  ];

  return Object.keys(formData).filter(key => numericFieldNames.includes(key));
}

/**
 * Get all UUID field names that should be cleaned
 */
export function getUuidFields(formData) {
  return Object.keys(formData).filter(key =>
    key.endsWith('_id') || key === 'id'
  );
}

/**
 * Auto-clean all form data by detecting field types
 */
export function autoCleanFormData(formData) {
  const dateFields = getDateFields(formData);
  const numericFields = getNumericFields(formData);
  const uuidFields = getUuidFields(formData);

  const cleaned = { ...formData };

  // Clean numeric fields
  numericFields.forEach(field => {
    if (cleaned[field] === "" || cleaned[field] === undefined || cleaned[field] === null) {
      cleaned[field] = null;
    } else if (!isNaN(cleaned[field])) {
      cleaned[field] = Number(cleaned[field]);
    }
  });

  // Clean date fields - empty strings must become null
  dateFields.forEach(field => {
    if (cleaned[field] === "" || cleaned[field] === undefined) {
      cleaned[field] = null;
    }
  });

  // Clean UUID fields - empty strings must become null
  uuidFields.forEach(field => {
    if (cleaned[field] === "" || cleaned[field] === undefined) {
      cleaned[field] = null;
    }
  });

  return cleaned;
}

export function formatCurrency(amount) {
  return Math.round(Number(amount) || 0).toLocaleString('fr-FR');
}

export function calculatePrixFAI(lot, tauxRetrocession = null) {
  const prixNetVendeur = Number(lot.prix_net_vendeur) || 0;
  const honoraires = Number(lot.honoraires) || 0;
  const partenaireId = lot.partenaire_id;
  const taux = tauxRetrocession !== null ? Number(tauxRetrocession) : 0;

  if (!honoraires) {
    return prixNetVendeur;
  }

  if (!partenaireId || taux === 0) {
    return prixNetVendeur + honoraires;
  }

  const retrocession = prixNetVendeur * (taux / 100);
  return prixNetVendeur + honoraires + retrocession;
}

export function calculateRetrocession(lot, tauxRetrocession) {
  const prixNetVendeur = Number(lot.prix_net_vendeur) || 0;
  const taux = Number(tauxRetrocession) || 0;
  const partenaireId = lot.partenaire_id;

  if (!partenaireId || taux === 0) {
    return 0;
  }

  return prixNetVendeur * (taux / 100);
}
