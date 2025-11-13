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
    'latitude', 'longitude'
  ];

  return Object.keys(formData).filter(key => numericFieldNames.includes(key));
}

/**
 * Auto-clean all form data by detecting field types
 */
export function autoCleanFormData(formData) {
  const dateFields = getDateFields(formData);
  const numericFields = getNumericFields(formData);
  return cleanFormData(formData, numericFields, dateFields);
}
