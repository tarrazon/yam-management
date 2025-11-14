import { supabase } from '@/lib/supabase';

/**
 * Service pour tracker les vues des lots et résidences
 */
export const viewsTracking = {
  /**
   * Enregistre une vue d'un lot ou d'une résidence
   * @param {string} entityType - 'lot' ou 'residence'
   * @param {string} entityId - ID de l'entité
   * @param {string} entityName - Nom/référence de l'entité
   * @param {object} userProfile - Profil de l'utilisateur (avec role_custom, partenaire_id, email)
   */
  async trackView(entityType, entityId, entityName, userProfile) {
    try {
      // Ne tracker que pour les partenaires (pas les admins)
      if (userProfile?.role_custom !== 'partenaire') {
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const viewData = {
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        user_id: user.id,
        user_email: userProfile.email || user.email,
        user_role: userProfile.role_custom,
        partenaire_id: userProfile.partenaire_id,
        partenaire_nom: userProfile.partenaire_nom || '',
        viewed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('vues_stats')
        .insert(viewData);

      if (error) {
        console.error('Error tracking view:', error);
      }
    } catch (error) {
      console.error('Error in trackView:', error);
    }
  },

  /**
   * Récupère le nombre de vues pour une entité
   * @param {string} entityType - 'lot' ou 'residence'
   * @param {string} entityId - ID de l'entité
   * @returns {Promise<number>}
   */
  async getViewsCount(entityType, entityId) {
    try {
      const { count, error } = await supabase
        .from('vues_stats')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting views count:', error);
      return 0;
    }
  },

  /**
   * Récupère le nombre de vues uniques (par partenaire) pour une entité
   * @param {string} entityType - 'lot' ou 'residence'
   * @param {string} entityId - ID de l'entité
   * @returns {Promise<number>}
   */
  async getUniqueViewsCount(entityType, entityId) {
    try {
      const { data, error } = await supabase
        .from('vues_stats')
        .select('partenaire_id')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .not('partenaire_id', 'is', null);

      if (error) throw error;

      // Compter les partenaires uniques
      const uniquePartenaires = new Set(data.map(v => v.partenaire_id));
      return uniquePartenaires.size;
    } catch (error) {
      console.error('Error getting unique views count:', error);
      return 0;
    }
  },

  /**
   * Récupère les statistiques de vues pour plusieurs entités
   * @param {string} entityType - 'lot' ou 'residence'
   * @param {string[]} entityIds - Liste des IDs
   * @returns {Promise<Map<string, {total: number, unique: number}>>}
   */
  async getBulkViewsStats(entityType, entityIds) {
    try {
      if (!entityIds || entityIds.length === 0) {
        return new Map();
      }

      const { data, error } = await supabase
        .from('vues_stats')
        .select('entity_id, partenaire_id')
        .eq('entity_type', entityType)
        .in('entity_id', entityIds);

      if (error) throw error;

      // Agréger les stats par entity_id
      const statsMap = new Map();

      data.forEach(view => {
        if (!statsMap.has(view.entity_id)) {
          statsMap.set(view.entity_id, {
            total: 0,
            uniquePartenaires: new Set()
          });
        }
        const stats = statsMap.get(view.entity_id);
        stats.total++;
        if (view.partenaire_id) {
          stats.uniquePartenaires.add(view.partenaire_id);
        }
      });

      // Convertir les Sets en nombres
      const result = new Map();
      statsMap.forEach((stats, entityId) => {
        result.set(entityId, {
          total: stats.total,
          unique: stats.uniquePartenaires.size
        });
      });

      return result;
    } catch (error) {
      console.error('Error getting bulk views stats:', error);
      return new Map();
    }
  },

  /**
   * Récupère les lots les plus vus
   * @param {number} limit - Nombre de résultats
   * @returns {Promise<Array>}
   */
  async getTopViewedLots(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('vues_stats')
        .select('entity_id, entity_name, partenaire_id')
        .eq('entity_type', 'lot')
        .order('viewed_at', { ascending: false });

      if (error) throw error;

      // Agréger par lot
      const lotsMap = new Map();
      data.forEach(view => {
        if (!lotsMap.has(view.entity_id)) {
          lotsMap.set(view.entity_id, {
            entity_id: view.entity_id,
            entity_name: view.entity_name,
            total: 0,
            uniquePartenaires: new Set()
          });
        }
        const stats = lotsMap.get(view.entity_id);
        stats.total++;
        if (view.partenaire_id) {
          stats.uniquePartenaires.add(view.partenaire_id);
        }
      });

      // Convertir en array et trier
      const results = Array.from(lotsMap.values())
        .map(stats => ({
          entity_id: stats.entity_id,
          entity_name: stats.entity_name,
          total: stats.total,
          unique: stats.uniquePartenaires.size
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('Error getting top viewed lots:', error);
      return [];
    }
  },

  /**
   * Récupère les résidences les plus vues
   * @param {number} limit - Nombre de résultats
   * @returns {Promise<Array>}
   */
  async getTopViewedResidences(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('vues_stats')
        .select('entity_id, entity_name, partenaire_id')
        .eq('entity_type', 'residence')
        .order('viewed_at', { ascending: false });

      if (error) throw error;

      // Agréger par résidence
      const residencesMap = new Map();
      data.forEach(view => {
        if (!residencesMap.has(view.entity_id)) {
          residencesMap.set(view.entity_id, {
            entity_id: view.entity_id,
            entity_name: view.entity_name,
            total: 0,
            uniquePartenaires: new Set()
          });
        }
        const stats = residencesMap.get(view.entity_id);
        stats.total++;
        if (view.partenaire_id) {
          stats.uniquePartenaires.add(view.partenaire_id);
        }
      });

      // Convertir en array et trier
      const results = Array.from(residencesMap.values())
        .map(stats => ({
          entity_id: stats.entity_id,
          entity_name: stats.entity_name,
          total: stats.total,
          unique: stats.uniquePartenaires.size
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('Error getting top viewed residences:', error);
      return [];
    }
  }
};
