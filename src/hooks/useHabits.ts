'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Habit } from '@/types/habit';
import { Goal } from '@/types/goal';
import { toast } from '@/components/ui/use-toast';

// --- Types ---

interface DashboardStats {
  totalActive: number;
  completionRate: number;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
}

// --- Generic Fetcher ---

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred while fetching data');
  }
  return res.json();
};

// --- CORE HOOKS ---

export function useHabits() {
  const queryClient = useQueryClient();
  const queryKey = ['habits'];

  // Normalize a local calendar day to UTC midnight (stable across timezones)
  const toUtcMidnightIso = (d: Date) =>
    new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)).toISOString();

  // 1. Fetch Habits
  const query = useQuery<{ data: Habit[]; page: number; limit: number }>({
    queryKey,
    queryFn: () => fetcher<{ data: Habit[]; page: number; limit: number }>('/api/habits'),
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
  });

  // 2. Toggle Habit Completion (Optimistic Update)
  const toggleMutation = useMutation({
    mutationFn: async ({ id, date, completed }: { id: string; date: Date; completed: boolean }) => {
      const iso = toUtcMidnightIso(date);

      const res = await fetch(`/api/habits/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId: id,
          date: iso,
          value: completed ? 1 : 0,
          completed: completed,
          meta: {},
        }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    // Optimistic Update Logic
    onMutate: async ({ id, date }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousHabits = queryClient.getQueryData<{ data: Habit[] }>(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<{ data: Habit[] }>(queryKey, (old) => {
        if (!old || !old.data) return { data: [] };
        return {
          ...old,
          data: old.data.map((h) => {
          if (h.id !== id) return h;

          const iso = toUtcMidnightIso(date);
          const logIndex = (h.logs || []).findIndex((l: any) => {
            const logIso =
              typeof l.date === 'string'
                ? new Date(l.date).toISOString()
                : l.date.toISOString();
            return logIso.slice(0, 10) === iso.slice(0, 10);
          });

          let newLogs;
          // Toggle logic: If exists, remove it. If not, add it.
          if (logIndex > -1) {
            newLogs = (h.logs || []).filter((_: any, i: number) => i !== logIndex);
          } else {
            newLogs = [
              ...(h.logs || []),
              {
                date: iso,
                completed: true,
                status: 'completed' as const,
              },
            ];
          }

            return { ...h, logs: newLogs };
          }),
        };
      });

      // Return a context object with the snapshotted value
      return { previousHabits };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKey, context.previousHabits);
      }
      toast({
        title: 'Failed to update habit',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state sync
      queryClient.invalidateQueries({ queryKey });
      // Also invalidate stats because completion affects them
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  // 3. Delete Habit
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Habit deleted',
        description: 'The habit has been removed successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Could not delete the habit.',
        variant: 'destructive',
      });
    },
  });

  // 4. Create Habit
  const createMutation = useMutation({
    mutationFn: async (newHabit: Partial<Habit>) => {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHabit),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Success', description: 'New habit created!' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Could not create habit.',
        variant: 'destructive',
      });
    },
  });

  return {
    habits: query.data?.data || [], // Extract data array from response
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    toggleHabit: toggleMutation.mutate,
    deleteHabit: deleteMutation.mutate,
    createHabit: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}

// --- STATS HOOK ---

export function useStats() {
  return useQuery<DashboardStats>({
    queryKey: ['stats'],
    queryFn: () => fetcher<DashboardStats>('/api/stats'),
    // Keep stats fresh slightly longer to prevent flickering
    staleTime: 1000 * 60 * 5,
  });
}

// --- GOALS HOOKS ---

export function useGoals() {
  const queryClient = useQueryClient();
  const queryKey = ['goals'];

  const query = useQuery<Goal[]>({
    queryKey,
    queryFn: () => fetcher<Goal[]>('/api/goals'),
  });

  const createGoal = useMutation({
    mutationFn: async (newGoal: Partial<Goal>) => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      });
      if (!res.ok) throw new Error('Failed to create goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Goal set successfully!' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create goal.',
        variant: 'destructive',
      });
    },
  });

  return {
    goals: query.data || [],
    isLoading: query.isLoading,
    createGoal: createGoal.mutate,
    isCreating: createGoal.isPending,
  };
}

// --- USER PROFILE HOOK ---

export function useUserProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => fetcher('/api/user/profile'),
  });
}
