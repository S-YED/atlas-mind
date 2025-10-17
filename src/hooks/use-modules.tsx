import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  content: any;
  level: DifficultyLevel;
  ai_tags: string[];
  estimated_time_minutes: number;
  created_at: string;
  updated_at: string;
}

interface UseModulesOptions {
  level?: DifficultyLevel;
  tags?: string[];
  searchQuery?: string;
}

export function useModules(options?: UseModulesOptions) {
  return useQuery({
    queryKey: ['learning-modules', options],
    queryFn: async () => {
      let query = supabase
        .from('learning_modules')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by level if provided
      if (options?.level) {
        query = query.eq('level', options.level);
      }

      // Filter by tags if provided
      if (options?.tags && options.tags.length > 0) {
        query = query.overlaps('ai_tags', options.tags);
      }

      // Search by title or description
      if (options?.searchQuery) {
        query = query.or(
          `title.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LearningModule[];
    },
  });
}
