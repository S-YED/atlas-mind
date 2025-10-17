import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

export interface AIRecommendation {
  id: string;
  user_id: string;
  suggested_module_ids: any;
  reasoning: string;
  confidence_score: number;
  created_at: string;
  expires_at: string;
}

export function useRecommendations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as AIRecommendation | null;
    },
    enabled: !!user?.id,
  });
}
