'use client';

import React, { useState } from 'react';
import { DailyCommandCenter, TimelineTask } from '@/components/organisms/DailyCommandCenter';
import { ContributionGraph, ContributionData } from '@/components/organisms/ContributionGraph';
import { AnalyticsHub, XPData, CategoryBreakdown } from '@/components/organisms/AnalyticsHub';
import { HabitMatrix, HabitMatrixData } from '@/components/organisms/HabitMatrix';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DashboardTile {
  id: string;
  component: React.ReactNode;
  title: string;
  colSpan?: number;
  rowSpan?: number;
  isMinimized?: boolean;
}

interface GridDashboardProps {
  date: Date;
  tasks: TimelineTask[];
  contributionData: ContributionData[];
  xpData: XPData[];
  categoryBreakdown: CategoryBreakdown[];
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  habitMatrixData: HabitMatrixData[];
  onTaskUpdate?: (taskId: string, updates: Partial<TimelineTask>) => void;
  onTaskMove?: (taskId: string, newStartTime: Date, newEndTime: Date) => void;
  onDayClick?: (date: Date) => void;
}

export const GridDashboard: React.FC<GridDashboardProps> = ({
  date,
  tasks,
  contributionData,
  xpData,
  categoryBreakdown,
  totalXP,
  currentLevel,
  xpToNextLevel,
  habitMatrixData,
  onTaskUpdate,
  onTaskMove,
  onDayClick,
}) => {
  const [minimizedTiles, setMinimizedTiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'7day' | '30day'>('7day');

  const toggleMinimize = (tileId: string) => {
    setMinimizedTiles((prev) => {
      const next = new Set(prev);
      if (next.has(tileId)) {
        next.delete(tileId);
      } else {
        next.add(tileId);
      }
      return next;
    });
  };

  // Grid-First Design: Modular tile system using CSS Grid
  return (
    <div className="w-full h-full p-4 space-y-4">
      {/* Grid Container */}
      <div className="grid grid-cols-12 gap-4 auto-rows-min">
        {/* Tile 1: Daily Command Center - Full Width */}
        <div className="col-span-12">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Daily Command Center</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMinimize('timeline')}
              >
                {minimizedTiles.has('timeline') ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent className={cn(minimizedTiles.has('timeline') && 'hidden')}>
              <DailyCommandCenter
                date={date}
                tasks={tasks}
                onTaskUpdate={onTaskUpdate}
                onTaskMove={onTaskMove}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tile 2: Analytics Hub - 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Analytics Hub</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMinimize('analytics')}
              >
                {minimizedTiles.has('analytics') ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent className={cn(minimizedTiles.has('analytics') && 'hidden')}>
              <AnalyticsHub
                xpData={xpData}
                categoryBreakdown={categoryBreakdown}
                totalXP={totalXP}
                currentLevel={currentLevel}
                xpToNextLevel={xpToNextLevel}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tile 3: Contribution Graph - 4 columns */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Activity Graph</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMinimize('contribution')}
              >
                {minimizedTiles.has('contribution') ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent className={cn(minimizedTiles.has('contribution') && 'hidden')}>
              <ContributionGraph
                data={contributionData}
                year={date.getFullYear()}
                onDayClick={onDayClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tile 4: Habit Matrix - Full Width */}
        <div className="col-span-12">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Habit Matrix</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === '7day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('7day')}
                >
                  7 Days
                </Button>
                <Button
                  variant={viewMode === '30day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('30day')}
                >
                  30 Days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleMinimize('habits')}
                >
                  {minimizedTiles.has('habits') ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={cn(minimizedTiles.has('habits') && 'hidden')}>
              <HabitMatrix
                habits={habitMatrixData}
                viewMode={viewMode}
                startDate={date}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
