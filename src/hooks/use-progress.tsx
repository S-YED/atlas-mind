import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

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
  totalStudyTime: number;
  currentStreak: number;
}

export function useProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['progress-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProgressLog[];
    },
    enabled: !!user?.id,
  });
}

export function useProgressStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['progress-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          totalModulesCompleted: 0,
          averageScore: 0,
          totalStudyTime: 0,
          currentStreak: 0,
        };
      }

      const { data, error } = await supabase
        .from('progress_logs')
        .select('completion_score, time_spent_minutes, completed_at')
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate stats
      const uniqueModules = new Set(data.map((log: any) => log.module_id)).size;
      const avgScore = data.length > 0
        ? data.reduce((sum: number, log: any) => sum + (log.completion_score || 0), 0) / data.length
        : 0;
      const totalTime = data.reduce((sum: number, log: any) => sum + (log.time_spent_minutes || 0), 0);

      // Calculate streak (consecutive days with activity)
      const sortedDates = data
        .map((log: any) => new Date(log.completed_at).toDateString())
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      let streak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
        streak = 1;
        let currentDate = new Date();
        
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(currentDate.getTime() - 86400000).toDateString();
          if (sortedDates.includes(prevDate)) {
            streak++;
            currentDate = new Date(prevDate);
          } else {
            break;
          }
        }
      }

      return {
        totalModulesCompleted: uniqueModules,
        averageScore: Math.round(avgScore),
        totalStudyTime: totalTime,
        currentStreak: streak,
      };
    },
    enabled: !!user?.id,
  });
}

export function useLogProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      moduleId,
      completionScore,
      timeSpentMinutes,
    }: {
      moduleId: string;
      completionScore: number;
      timeSpentMinutes: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          completion_score: completionScore,
          time_spent_minutes: timeSpentMinutes,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-logs'] });
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] });
      toast({
        title: 'Progress saved!',
        description: 'Your learning progress has been recorded.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save progress',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
