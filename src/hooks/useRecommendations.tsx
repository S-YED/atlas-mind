import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface AIRecommendation {
  id: string;
  user_id: string;
  suggested_module_ids: any;
  reasoning: string | null;
  confidence_score: number | null;
  created_at: string;
  expires_at: string;
}

/**
 * Custom hook to fetch AI-generated recommendations for the current user
 * @returns React Query result with recommendations data
 */
export function useRecommendations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai_recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw new Error(`Failed to fetch recommendations: ${error.message}`);
      }

      return data as AIRecommendation[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to generate new AI recommendations
 * Will be used to call the AI Edge Function in Phase 2
 * @returns Mutation function to generate recommendations
 */
export function useGenerateRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User must be authenticated to generate recommendations');
      }

      // TODO: Phase 2 - Call AI Edge Function here
      // For now, create a mock recommendation
      const mockRecommendation = {
        user_id: user.id,
        suggested_module_ids: JSON.stringify([]),
        reasoning: 'AI recommendations will be generated in Phase 2',
        confidence_score: 0,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data, error } = await supabase
        .from('ai_recommendations')
        .insert(mockRecommendation)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to generate recommendations: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_recommendations'] });
      
      toast({
        title: 'Recommendations updated',
        description: 'AI has generated new learning recommendations for you.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to generate recommendations',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Custom hook to fetch recommended modules with details
 * Combines recommendations with actual module data
 * @returns React Query result with enriched recommendation data
 */
export function useRecommendedModules() {
  const { user } = useAuth();
  const { data: recommendations } = useRecommendations();

  return useQuery({
    queryKey: ['recommended_modules', user?.id, recommendations],
    queryFn: async () => {
      if (!recommendations || recommendations.length === 0) return [];

      // Get the latest recommendation
      const latestRec = recommendations[0];
      const moduleIds = Array.isArray(latestRec.suggested_module_ids)
        ? latestRec.suggested_module_ids
        : [];

      if (moduleIds.length === 0) return [];

      // Fetch module details
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .in('id', moduleIds);

      if (error) {
        throw new Error(`Failed to fetch recommended modules: ${error.message}`);
      }

      return data;
    },
    enabled: !!user && !!recommendations && recommendations.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
