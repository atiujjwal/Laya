'use client';

import React from 'react';
import { DailyCommandCenter, TimelineTask } from '@/components/organisms/DailyCommandCenter';
import { useTimelineTasks, useMoveTimelineTask, useUpdateTimelineTask } from '@/hooks/useTimeline';
import { useLayaStore } from '@/lib/store';
import { useDayPlan, useGeneratePlan } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { SkeletonTimeline } from '@/components/ui/skeleton-enhanced';

export default function EnhancedPlannerPage() {
  const { currentDate } = useLayaStore();
  const { data: plan, isLoading } = useDayPlan(currentDate);
  const generate = useGeneratePlan();
  
  const { data: timelineTasks = [], isLoading: timelineLoading } = useTimelineTasks(currentDate);
  const moveTask = useMoveTimelineTask();
  const updateTask = useUpdateTimelineTask();

  const handleTaskUpdate = (taskId: string, updates: Partial<TimelineTask>) => {
    updateTask.mutate({ taskId, updates });
  };

  const handleTaskMove = (taskId: string, newStartTime: Date, newEndTime: Date) => {
    moveTask.mutate({ taskId, newStartTime, newEndTime });
  };

  const handleConflictDetected = (conflicts: string[]) => {
    console.warn('Conflicts detected:', conflicts);
    // In production, show a toast notification
  };

  if (isLoading || timelineLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <SkeletonTimeline />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            Plan for {format(currentDate, 'MMMM do')}
          </h1>
          <p className="text-muted-foreground">AI-Optimized Schedule</p>
        </div>

        <Button
          onClick={() => generate.mutate(currentDate)}
          disabled={generate.isPending}
          className="bg-primary hover:bg-primary/90"
        >
          {generate.isPending ? (
            'Generating...'
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Auto-Schedule Day
            </>
          )}
        </Button>
      </div>

      <DailyCommandCenter
        date={currentDate}
        tasks={timelineTasks}
        onTaskUpdate={handleTaskUpdate}
        onTaskMove={handleTaskMove}
        onConflictDetected={handleConflictDetected}
      />
    </div>
  );
}
