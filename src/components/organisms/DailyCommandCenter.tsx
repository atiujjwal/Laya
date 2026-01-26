'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { format, addMinutes, startOfDay, setHours, setMinutes } from 'date-fns';
import { ZoomIn, ZoomOut, Lock, Unlock, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type TimeResolution = 'hour' | '5min';

export interface TimelineTask {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'habit' | 'work' | 'personal' | 'break';
  color?: string;
  isLocked?: boolean;
  priority?: number;
  category?: string;
}

interface DailyCommandCenterProps {
  date: Date;
  tasks: TimelineTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<TimelineTask>) => void;
  onTaskMove?: (taskId: string, newStartTime: Date, newEndTime: Date) => void;
  onTaskDelete?: (taskId: string) => void;
  onConflictDetected?: (conflicts: string[]) => void;
}

const HOUR_HEIGHT = 60; // Base height for hour view
const MINUTE_HEIGHT = 12; // Height for 5-minute view (12px per 5min = 60px per hour)

export const DailyCommandCenter: React.FC<DailyCommandCenterProps> = ({
  date,
  tasks,
  onTaskUpdate,
  onTaskMove,
  onTaskDelete,
  onConflictDetected,
}) => {
  const [resolution, setResolution] = useState<TimeResolution>('hour');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate timeline dimensions
  const timelineHeight = useMemo(() => {
    return resolution === 'hour' ? HOUR_HEIGHT * 24 : MINUTE_HEIGHT * 288; // 288 = 24 hours * 12 (5-min blocks)
  }, [resolution]);

  // Convert time to pixel position
  const timeToPixels = useCallback(
    (time: Date): number => {
      const dayStart = startOfDay(date);
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      if (resolution === 'hour') {
        return (totalMinutes / 60) * HOUR_HEIGHT;
      } else {
        return (totalMinutes / 5) * MINUTE_HEIGHT;
      }
    },
    [date, resolution]
  );

  // Convert pixel position to time
  const pixelsToTime = useCallback(
    (pixels: number): Date => {
      const dayStart = startOfDay(date);
      let totalMinutes: number;

      if (resolution === 'hour') {
        totalMinutes = (pixels / HOUR_HEIGHT) * 60;
      } else {
        totalMinutes = (pixels / MINUTE_HEIGHT) * 5;
      }

      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      return setMinutes(setHours(dayStart, hours), minutes);
    },
    [date, resolution]
  );

  // Conflict Detection Algorithm - O(n) complexity
  const detectConflicts = useCallback(
    (taskId: string, newStart: Date, newEnd: Date): string[] => {
      const conflicts: string[] = [];
      const otherTasks = tasks.filter((t) => t.id !== taskId && !t.isLocked);

      for (const task of otherTasks) {
        // Check for overlap: newStart < task.endTime && newEnd > task.startTime
        if (newStart < task.endTime && newEnd > task.startTime) {
          conflicts.push(task.id);
        }
      }

      return conflicts;
    },
    [tasks]
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent, task: TimelineTask) => {
      if (task.isLocked) return;

      e.preventDefault();
      setDraggedTask(task.id);
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - timeToPixels(task.startTime),
        });
      }
    },
    [timeToPixels]
  );

  // Handle drag
  const handleDrag = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedTask || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top - dragOffset.y;
      const clampedY = Math.max(0, Math.min(y, timelineHeight));

      const newStartTime = pixelsToTime(clampedY);
      const task = tasks.find((t) => t.id === draggedTask);
      if (!task) return;

      const duration = task.endTime.getTime() - task.startTime.getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);

      // Check conflicts
      const conflicts = detectConflicts(draggedTask, newStartTime, newEndTime);
      if (conflicts.length > 0 && onConflictDetected) {
        onConflictDetected(conflicts);
      }

      if (onTaskMove) {
        onTaskMove(draggedTask, newStartTime, newEndTime);
      }
    },
    [draggedTask, dragOffset, timelineHeight, pixelsToTime, tasks, detectConflicts, onTaskMove, onConflictDetected]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Generate time labels
  const timeLabels = useMemo(() => {
    const labels: { time: Date; label: string }[] = [];
    const dayStart = startOfDay(date);

    if (resolution === 'hour') {
      for (let i = 0; i < 24; i++) {
        labels.push({
          time: setHours(dayStart, i),
          label: format(setHours(dayStart, i), 'h:mm a'),
        });
      }
    } else {
      for (let i = 0; i < 288; i += 12) {
        // Every hour in 5-min view
        const minutes = i * 5;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        labels.push({
          time: setMinutes(setHours(dayStart, hours), mins),
          label: format(setMinutes(setHours(dayStart, hours), mins), 'h:mm a'),
        });
      }
    }

    return labels;
  }, [date, resolution]);

  // Render task blocks
  const renderTasks = useMemo(() => {
    return tasks.map((task) => {
      const top = timeToPixels(task.startTime);
      const height = timeToPixels(task.endTime) - top;
      const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60);

      return (
        <div
          key={task.id}
          className={cn(
            'absolute left-0 right-0 rounded-lg border-2 transition-all',
            'hover:shadow-lg cursor-move group',
            task.isLocked && 'opacity-60 cursor-not-allowed',
            draggedTask === task.id && 'z-50 shadow-xl scale-105'
          )}
          style={{
            top: `${top}px`,
            height: `${height}px`,
            backgroundColor: task.color || 'hsl(var(--primary))',
            borderColor: task.color || 'hsl(var(--primary))',
            opacity: task.isLocked ? 0.6 : 1,
          }}
          onMouseDown={(e) => handleDragStart(e, task)}
          onMouseMove={handleDrag}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div className="h-full p-2 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                <span className="text-xs font-semibold text-white truncate">
                  {task.title}
                </span>
                {task.isLocked && (
                  <Lock className="w-3 h-3 text-white opacity-70" />
                )}
              </div>
              <span className="text-[10px] text-white/80">
                {format(task.startTime, 'h:mm')} - {format(task.endTime, 'h:mm')} ({Math.round(duration)}m)
              </span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTaskUpdate) {
                    onTaskUpdate(task.id, { isLocked: !task.isLocked });
                  }
                }}
                className="p-1 hover:bg-white/20 rounded"
              >
                {task.isLocked ? (
                  <Unlock className="w-3 h-3 text-white" />
                ) : (
                  <Lock className="w-3 h-3 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      );
    });
  }, [tasks, timeToPixels, draggedTask, handleDragStart, handleDrag, handleDragEnd, onTaskUpdate]);

  return (
    <div className="w-full bg-card border rounded-xl p-4 space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Daily Command Center</h2>
          <p className="text-sm text-muted-foreground">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResolution(resolution === 'hour' ? '5min' : 'hour')}
          >
            {resolution === 'hour' ? (
              <>
                <ZoomIn className="w-4 h-4 mr-2" />
                Hour View
              </>
            ) : (
              <>
                <ZoomOut className="w-4 h-4 mr-2" />
                5-Min View
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative border rounded-lg overflow-hidden bg-muted/20">
        <div
          ref={timelineRef}
          className="relative"
          style={{ height: `${timelineHeight}px`, minHeight: '600px' }}
        >
          {/* Time Labels */}
          <div className="absolute left-0 top-0 bottom-0 w-20 border-r bg-background/50 z-10">
            {timeLabels.map((label, idx) => {
              const top = timeToPixels(label.time);
              return (
                <div
                  key={idx}
                  className="absolute text-xs text-muted-foreground px-2"
                  style={{ top: `${top}px` }}
                >
                  {label.label}
                </div>
              );
            })}
          </div>

          {/* Timeline Grid */}
          <div className="absolute left-20 right-0 top-0 bottom-0">
            {timeLabels.map((label, idx) => {
              const top = timeToPixels(label.time);
              return (
                <div
                  key={idx}
                  className="absolute left-0 right-0 border-t border-border/50"
                  style={{ top: `${top}px` }}
                />
              );
            })}
          </div>

          {/* Task Blocks */}
          <div className="absolute left-20 right-0 top-0 bottom-0">
            {renderTasks}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Habits</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-secondary" />
          <span>Work</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-accent" />
          <span>Personal</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3" />
          <span>Locked (AI won't reschedule)</span>
        </div>
      </div>
    </div>
  );
};
