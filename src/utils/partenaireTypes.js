export const PARTENAIRE_TYPES_HIERARCHY = {
  cgp: {
    label: "CGP",
    children: {
      vendeur_lmnp_bail_commercial: {
        label: "Vendeur LMNP bail commercial",
        children: {
          etudiant: { label: "Étudiant" },
          affaires: { label: "Affaires" },
          tourisme: { label: "Tourisme" },
          senior: { label: "Sénior" },
          ehpad: { label: "Ehpad" }
        }
      },
      vendeur_lmnp_gestion_libre: { label: "Vendeur LMNP gestion libre" },
      vendeur_deficit_foncier: { label: "Vendeur déficit foncier" },
      vendeur_malraux_mh: { label: "Vendeur Malraux - MH" },
      vendeur_denormandie: { label: "Vendeur Denormandie" },
      apporteur_affaires: { label: "Apporteur d'affaires" }
    }
  },
  conseiller_investissement: {
    label: "Conseiller en investissement immobilier",
    children: {
      vendeur_lmnp_bail_commercial: {
        label: "Vendeur LMNP bail commercial",
        children: {
          etudiant: { label: "Étudiant" },
          affaires: { label: "Affaires" },
          tourisme: { label: "Tourisme" },
          senior: { label: "Sénior" },
          ehpad: { label: "Ehpad" }
        }
      },
      vendeur_lmnp_gestion_libre: {
        label: "Vendeur LMNP gestion libre sélection",
        children: {
          vendeur_deficit_foncier: { label: "Vendeur déficit foncier" },
          vendeur_malraux_mh: { label: "Vendeur Malraux - MH" },
          vendeur_denormandie: { label: "Vendeur Denormandie" },
          apporteur_affaires: { label: "Apporteur d'affaires" }
        }
      }
    }
  },
  agent_immobilier: {
    label: "Agent immobilier",
    children: {
      vendeur_lmnp_bail_commercial: {
        label: "Vendeur LMNP bail commercial",
        children: {
          etudiant: { label: "Étudiant" },
          affaires: { label: "Affaires" },
          tourisme: { label: "Tourisme" },
          senior: { label: "Sénior" },
          ehpad: { label: "Ehpad" }
        }
      },
      vendeur_lmnp_gestion_libre: { label: "Vendeur LMNP gestion libre" },
      vendeur_deficit_foncier: { label: "Vendeur déficit foncier" },
      vendeur_malraux_mh: { label: "Vendeur Malraux - MH" },
      vendeur_denormandie: { label: "Vendeur Denormandie" },
      apporteur_affaires: { label: "Apporteur d'affaires" },
      residence_principale: { label: "Résidence Principale" }
    }
  },
  notaire: {
    label: "Notaire",
    children: {
      notaire_vendeur: { label: "Notaire vendeur" },
      notaire_acquereur: { label: "Notaire acquéreur" },
      notaire_apporteur_affaires: { label: "Notaire apporteur d'affaires" }
    }
  },
  avocat: {
    label: "Avocat",
    children: {
      fiscaliste: { label: "Fiscaliste" },
      droit_affaires: { label: "Droit des affaires" },
      defense_proprietaires: { label: "Défense des propriétaires" }
    }
  },
  vendeur_immobilier: {
    label: "Vendeur immobilier",
    children: {
      lmnp_bail_commercial: { label: "LMNP bail commercial" },
      lmnp_mandat_gestion: { label: "LMNP mandat de gestion" },
      immeubles: {
        label: "Immeubles",
        children: {
          residentiel: { label: "Résidentiel" },
          bureaux: { label: "Bureaux" },
          logistic: { label: "Logistic" },
          residence_services: {
            label: "Résidence services",
            children: {
              etudiant: { label: "Étudiant" },
              affaires: { label: "Affaires" },
              loisirs: { label: "Loisirs" },
              senior: { label: "Sénior" },
              ehpad: { label: "Ehpad" }
            }
          }
        }
      },
      terrain: { label: "Terrain" },
      appartement: { label: "Appartement" },
      maison: { label: "Maison" },
      hotel: {
        label: "Hôtel",
        children: {
          mer: { label: "Mer" },
          fond_commerce: { label: "Fond de commerce" }
        }
      }
    }
  }
};

export function formatPartenaireTypes(typesJson) {
  if (!typesJson || typeof typesJson !== 'object') return [];

  const result = [];

  Object.entries(typesJson).forEach(([mainCategory, subCategories]) => {
    const mainCategoryConfig = PARTENAIRE_TYPES_HIERARCHY[mainCategory];
    if (!mainCategoryConfig) return;

    if (Array.isArray(subCategories) && subCategories.length === 0) {
      result.push(mainCategoryConfig.label);
    } else if (typeof subCategories === 'object') {
      Object.entries(subCategories).forEach(([subCat, subSubCats]) => {
        const subCatConfig = mainCategoryConfig.children?.[subCat];
        if (!subCatConfig) return;

        if (Array.isArray(subSubCats) && subSubCats.length === 0) {
          result.push(`${mainCategoryConfig.label} - ${subCatConfig.label}`);
        } else if (Array.isArray(subSubCats)) {
          subSubCats.forEach(subSubCat => {
            const subSubCatConfig = subCatConfig.children?.[subSubCat];
            if (subSubCatConfig) {
              result.push(`${mainCategoryConfig.label} - ${subCatConfig.label} - ${subSubCatConfig.label}`);
            }
          });
        }
      });
    }
  });

  return result;
}

export function flattenPartenaireTypes(typesJson) {
  if (!typesJson || typeof typesJson !== 'object') return [];

  const result = [];

  Object.entries(typesJson).forEach(([mainCategory, subCategories]) => {
    result.push(mainCategory);

    if (typeof subCategories === 'object' && !Array.isArray(subCategories)) {
      Object.entries(subCategories).forEach(([subCat, subSubCats]) => {
        result.push(`${mainCategory}.${subCat}`);

        if (Array.isArray(subSubCats)) {
          subSubCats.forEach(subSubCat => {
            result.push(`${mainCategory}.${subCat}.${subSubCat}`);
          });
        }
      });
    }
  });

  return result;
}
