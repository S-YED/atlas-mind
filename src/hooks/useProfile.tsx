import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  learning_preferences: any;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

/**
 * Custom hook to fetch the current user's profile
 * @returns React Query result with profile data
 */
export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }

      return data as UserProfile | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to update user profile
 * @returns Mutation function to update profile with optimistic updates
 */
export function useUpdateProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user) {
        throw new Error('User must be authenticated to update profile');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return data;
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile', user?.id] });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(['profile', user?.id]);

      // Optimistically update profile
      queryClient.setQueryData(['profile', user?.id], (old: UserProfile | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      return { previousProfile };
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', user?.id], context.previousProfile);
      }

      toast({
        title: 'Failed to update profile',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}

/**
 * Custom hook to update learning preferences
 * Convenience wrapper around useUpdateProfile for preferences
 * @returns Mutation function to update only learning preferences
 */
export function useUpdateLearningPreferences() {
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async (preferences: any) => {
      return updateProfile.mutateAsync({
        learning_preferences: preferences,
      });
    },
  });
}
