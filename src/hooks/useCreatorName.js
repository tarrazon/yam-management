import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useCreatorName(createdBy) {
  const [creatorName, setCreatorName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!createdBy) {
      setCreatorName(null);
      setLoading(false);
      return;
    }

    const fetchCreatorName = async () => {
      try {
        setLoading(true);

        const profile = await base44.entities.Profile.findOne(createdBy);

        if (profile) {
          const fullName = [profile.prenom, profile.nom]
            .filter(Boolean)
            .join(' ') || profile.email || createdBy;
          setCreatorName(fullName);
        } else {
          setCreatorName(createdBy);
        }
      } catch (error) {
        console.error('Error fetching creator name:', error);
        setCreatorName(createdBy);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorName();
  }, [createdBy]);

  return { creatorName, loading };
}
