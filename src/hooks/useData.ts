'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Habit } from '@/types/habit';
import { Goal } from '@/types/goal';
import { toast } from '@/components/ui/use-toast';

// --- Generic Fetcher ---
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API Error');
  }
  return res.json();
};

// --- HABITS HOOKS ---

export function useHabits() {
  const queryClient = useQueryClient();

  // 1. Fetch Habits
  const query = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: () => fetcher('/api/habits'),
  });

  // 2. Toggle Habit Completion (Optimistic Update)
  const toggleHabit = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: Date }) => {
      // API expects YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];

      const res = await fetch(`/api/habits/${id}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr }),
      });

      if (!res.ok) throw new Error('Failed to update habit');
      return res.json();
    },
    // Optimistic Update Logic
    onMutate: async ({ id, date }) => {
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      const previousHabits = queryClient.getQueryData<Habit[]>(['habits']);

      queryClient.setQueryData<Habit[]>(['habits'], (old) => {
        if (!old) return [];
        return old.map((h) => {
          if (h.id !== id) return h;

          const dateStr = date.toISOString().split('T')[0];
          const logIndex = h.logs.findIndex((l) => l.date === dateStr);

          let newLogs;
          if (logIndex > -1) {
            // Remove log if it exists
            newLogs = h.logs.filter((_, i) => i !== logIndex);
          } else {
            // Add log if it doesn't exist
            newLogs = [
              ...h.logs,
              { date: dateStr, status: 'completed' as const },
            ];
          }

          return { ...h, logs: newLogs };
        });
      });

      return { previousHabits };
    },
    onError: (err, variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits'], context.previousHabits);
      }
      toast({ title: 'Failed to update status', variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  // 3. Delete Habit
  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete habit', variant: 'destructive' });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    toggleHabit: toggleHabit.mutate,
    deleteHabit: deleteHabit.mutate,
  };
}

// --- GOALS HOOKS ---

export function useGoals() {
  const queryClient = useQueryClient();

  const query = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: () => fetcher('/api/goals'),
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
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Goal created successfully!' });
    },
    onError: () => {
      toast({ title: 'Failed to create goal', variant: 'destructive' });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    createGoal: createGoal.mutate,
    isCreating: createGoal.isPending,
  };
}

// --- USER & STATS HOOKS ---

export function useUserProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => fetcher('/api/user/profile'),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      //TODO: In a real app, you might have a dedicated /api/stats endpoint.
      // Or you can calculate these on the client from the 'habits' data if the dataset is small.
      // For now, let's assume a dedicated endpoint for performance.
      return fetcher('/api/stats');
    },
  });
}
