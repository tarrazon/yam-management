import { useQuery } from '@tanstack/react-query';
import { messagesPartenairesService } from '@/api/messagesPartenaires';

export function useMessagesNonLus(partenaireId) {
  return useQuery({
    queryKey: ['unread-messages-partenaires', partenaireId],
    queryFn: async () => {
      if (!partenaireId) return 0;
      const count = await messagesPartenairesService.countNonLus(partenaireId);
      return count;
    },
    enabled: !!partenaireId,
    refetchInterval: 5000,
  });
}
