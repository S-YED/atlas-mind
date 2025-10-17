import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface ProgressLog {
  id: string;
  user_id: string;
  module_id: string;
  completion_score: number;
  time_spent_minutes: number;
  completed_at: string;
  created_at: string;
}

export interface ProgressStats {
  totalModulesCompleted: number;
  averageScore: number;
  totalStudyTimeMinutes: number;
  currentStreak: number;
  recentActivity: ProgressLog[];
}

/**
 * Custom hook to fetch user's progress logs
 * @returns React Query result with progress data
 */
export function useProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['progress_logs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch progress: ${error.message}`);
      }

      return data as ProgressLog[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Custom hook to fetch aggregated progress statistics
 * @returns React Query result with stats
 */
export function useProgressStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['progress_stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: logs, error } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch progress stats: ${error.message}`);
      }

      // Calculate statistics
      const uniqueModules = new Set(logs.map(log => log.module_id));
      const totalModulesCompleted = uniqueModules.size;
      
      const averageScore = logs.length > 0
        ? logs.reduce((sum, log) => sum + (log.completion_score || 0), 0) / logs.length
        : 0;
      
      const totalStudyTimeMinutes = logs.reduce(
        (sum, log) => sum + (log.time_spent_minutes || 0),
        0
      );

      // Calculate streak (consecutive days with activity)
      const currentStreak = calculateStreak(logs);

      // Get last 10 activities
      const recentActivity = logs.slice(0, 10);

      const stats: ProgressStats = {
        totalModulesCompleted,
        averageScore: Math.round(averageScore * 100) / 100,
        totalStudyTimeMinutes,
        currentStreak,
        recentActivity,
      };

      return stats;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Helper function to calculate learning streak
 */
function calculateStreak(logs: ProgressLog[]): number {
  if (logs.length === 0) return 0;

  const dates = logs.map(log => {
    const date = new Date(log.created_at);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  });

  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a);

  let streak = 0;
  const today = new Date();
  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = todayTime - (i * 24 * 60 * 60 * 1000);
    if (uniqueDates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Custom hook to log progress for a module
 * @returns Mutation function to log progress
 */
export function useLogProgress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      moduleId: string;
      completionScore: number;
      timeSpentMinutes: number;
    }) => {
      if (!user) {
        throw new Error('User must be authenticated to log progress');
      }

      const { data, error } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          module_id: params.moduleId,
          completion_score: params.completionScore,
          time_spent_minutes: params.timeSpentMinutes,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to log progress: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate progress queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['progress_logs'] });
      queryClient.invalidateQueries({ queryKey: ['progress_stats'] });

      toast({
        title: 'Progress saved!',
        description: 'Your learning progress has been recorded.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to save progress',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
