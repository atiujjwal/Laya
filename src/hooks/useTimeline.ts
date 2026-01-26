'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimelineTask } from '@/components/organisms/DailyCommandCenter';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch timeline');
  }
  return res.json();
};

/**
 * Fetch timeline tasks for a specific date
 */
export function useTimelineTasks(date: Date) {
  const dateKey = format(date, 'yyyy-MM-dd');
  
  return useQuery<TimelineTask[]>({
    queryKey: ['timeline', dateKey],
    queryFn: () => fetcher<TimelineTask[]>(`/api/timeline?date=${dateKey}`),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Update a timeline task
 */
export function useUpdateTimelineTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<TimelineTask> }) => {
      const res = await fetch(`/api/timeline/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update task');
      }
      
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate timeline queries
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      toast({
        title: 'Task updated',
        description: 'The task has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Move a timeline task
 */
export function useMoveTimelineTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      taskId,
      newStartTime,
      newEndTime,
    }: {
      taskId: string;
      newStartTime: Date;
      newEndTime: Date;
    }) => {
      const res = await fetch(`/api/timeline/${taskId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
        }),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to move task');
      }
      
      return res.json();
    },
    onMutate: async ({ taskId, newStartTime, newEndTime }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['timeline'] });
      
      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<TimelineTask[]>(['timeline']);
      
      // Optimistically update
      queryClient.setQueryData<TimelineTask[]>(['timeline'], (old) => {
        if (!old) return [];
        return old.map((task) =>
          task.id === taskId
            ? { ...task, startTime: newStartTime, endTime: newEndTime }
            : task
        );
      });
      
      return { previousTasks };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['timeline'], context.previousTasks);
      }
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      toast({
        title: 'Task moved',
        description: 'The task has been rescheduled successfully.',
      });
    },
  });
}

/**
 * Delete a timeline task
 */
export function useDeleteTimelineTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/timeline/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete task');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      toast({
        title: 'Task deleted',
        description: 'The task has been removed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
