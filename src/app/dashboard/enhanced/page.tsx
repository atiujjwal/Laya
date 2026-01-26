'use client';

import React, { useMemo, useState } from 'react';
import { GridDashboard } from '@/components/templates/GridDashboard';
import { DailyCommandCenter, TimelineTask } from '@/components/organisms/DailyCommandCenter';
import { ContributionGraph, ContributionData } from '@/components/organisms/ContributionGraph';
import { AnalyticsHub, XPData, CategoryBreakdown } from '@/components/organisms/AnalyticsHub';
import { HabitMatrix, HabitMatrixData } from '@/components/organisms/HabitMatrix';
import { useLayaStore } from '@/lib/store';
import { format, startOfDay, addHours, addMinutes } from 'date-fns';
import { SkeletonChart, SkeletonCard } from '@/components/ui/skeleton-enhanced';

// Mock data - in production, this would come from API/hooks
const mockTasks: TimelineTask[] = [
  {
    id: '1',
    title: 'Morning Meditation',
    startTime: addHours(startOfDay(new Date()), 7),
    endTime: addMinutes(addHours(startOfDay(new Date()), 7), 15),
    type: 'habit',
    color: 'hsl(var(--primary))',
    isLocked: false,
    priority: 5,
  },
  {
    id: '2',
    title: 'Gym Workout',
    startTime: addHours(startOfDay(new Date()), 8),
    endTime: addMinutes(addHours(startOfDay(new Date()), 8), 60),
    type: 'habit',
    color: 'hsl(var(--secondary))',
    isLocked: false,
    priority: 4,
  },
  {
    id: '3',
    title: 'Deep Work Session',
    startTime: addHours(startOfDay(new Date()), 10),
    endTime: addMinutes(addHours(startOfDay(new Date()), 10), 120),
    type: 'work',
    color: 'hsl(var(--accent))',
    isLocked: true,
    priority: 5,
  },
];

const mockContributionData: ContributionData[] = Array.from({ length: 365 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (365 - i));
  return {
    date,
    count: Math.floor(Math.random() * 10),
    level: Math.min(4, Math.floor(Math.random() * 5)) as 0 | 1 | 2 | 3 | 4,
  };
});

const mockXPData: XPData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (30 - i));
  return {
    date: format(date, 'yyyy-MM-dd'),
    xp: Math.floor(Math.random() * 500) + 100,
    category: ['health', 'work', 'personal', 'learning'][Math.floor(Math.random() * 4)],
  };
});

const mockCategoryBreakdown: CategoryBreakdown[] = [
  { name: 'Health', value: 2500, color: 'hsl(var(--primary))' },
  { name: 'Work', value: 1800, color: 'hsl(var(--secondary))' },
  { name: 'Personal', value: 1200, color: 'hsl(var(--accent))' },
  { name: 'Learning', value: 900, color: 'hsl(var(--success))' },
];

const mockHabitMatrixData: HabitMatrixData[] = [
  {
    habitId: '1',
    habitTitle: 'Morning Meditation',
    habitColor: 'hsl(var(--primary))',
    completions: Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (5 - i));
      return date;
    }),
  },
  {
    habitId: '2',
    habitTitle: 'Gym Workout',
    habitColor: 'hsl(var(--secondary))',
    completions: Array.from({ length: 3 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (3 - i));
      return date;
    }),
  },
];

export default function EnhancedDashboardPage() {
  const { currentDate } = useLayaStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleTaskUpdate = (taskId: string, updates: Partial<TimelineTask>) => {
    console.log('Task updated:', taskId, updates);
    // In production, call API to update task
  };

  const handleTaskMove = (taskId: string, newStartTime: Date, newEndTime: Date) => {
    console.log('Task moved:', taskId, newStartTime, newEndTime);
    // In production, call API to move task
  };

  const handleDayClick = (date: Date) => {
    console.log('Day clicked:', date);
    // Navigate to that day's view
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard lines={2} />
        <SkeletonChart />
      </div>
    );
  }

  return (
    <GridDashboard
      date={currentDate}
      tasks={mockTasks}
      contributionData={mockContributionData}
      xpData={mockXPData}
      categoryBreakdown={mockCategoryBreakdown}
      totalXP={6400}
      currentLevel={6}
      xpToNextLevel={400}
      habitMatrixData={mockHabitMatrixData}
      onTaskUpdate={handleTaskUpdate}
      onTaskMove={handleTaskMove}
      onDayClick={handleDayClick}
    />
  );
}
