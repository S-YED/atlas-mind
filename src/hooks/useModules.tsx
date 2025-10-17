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
  search?: string;
}

/**
 * Custom hook to fetch and filter learning modules
 * @param options - Filter options (level, tags, search)
 * @returns React Query result with modules data
 */
export function useModules(options: UseModulesOptions = {}) {
  return useQuery({
    queryKey: ['learning_modules', options],
    queryFn: async () => {
      let query = supabase
        .from('learning_modules')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by difficulty level
      if (options.level) {
        query = query.eq('level', options.level);
      }

      // Filter by tags (modules containing any of the specified tags)
      if (options.tags && options.tags.length > 0) {
        query = query.overlaps('ai_tags', options.tags);
      }

      // Search in title and description
      if (options.search) {
        query = query.or(
          `title.ilike.%${options.search}%,description.ilike.%${options.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch modules: ${error.message}`);
      }

      return data as LearningModule[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch a single learning module by ID
 * @param moduleId - Module ID to fetch
 * @returns React Query result with single module data
 */
export function useModule(moduleId: string | undefined) {
  return useQuery({
    queryKey: ['learning_module', moduleId],
    queryFn: async () => {
      if (!moduleId) return null;

      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('id', moduleId)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch module: ${error.message}`);
      }

      return data as LearningModule | null;
    },
    enabled: !!moduleId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
