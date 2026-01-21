'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Image as ImageIcon, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/atoms/CircularProgress';
import { StatusBadge, GoalStatus } from '@/components/atoms/StatusBadge';
import {
  AreaOfLifeBadge,
  AreaType,
} from '@/components/molecules/AreaOfLifeBadge';
import { GoalStepItem } from '@/components/molecules/GoalStepItem';

// Type Definition (Move to types/goal.ts in real app)
export interface GoalStep {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Goal {
  id: string;
  title: string;
  area: AreaType;
  deadline: Date;
  reward: string;
  imageUrl?: string;
  steps: GoalStep[];
}

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal: initialGoal }: GoalCardProps) {
  const [goal, setGoal] = useState(initialGoal);

  // Computed Progress
  const completedSteps = goal.steps.filter((s) => s.isCompleted).length;
  const totalSteps = goal.steps.length;
  const progress = totalSteps === 0 ? 0 : (completedSteps / totalSteps) * 100;

  // Determine Status automatically based on progress
  let status: GoalStatus = 'Not Started';
  if (progress === 100) status = 'Achieved';
  else if (progress > 0) status = 'In Progress';

  const handleToggleStep = (stepId: string) => {
    setGoal((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s,
      ),
    }));
  };

  return (
    <Card className="overflow-hidden border-neutral-200 shadow-sm hover:shadow-md transition-all group">
      {/* Header Image Area */}
      <div className="h-32 bg-neutral-100 relative group-hover:bg-neutral-200 transition-colors flex items-center justify-center overflow-hidden">
        {goal.imageUrl ? (
          <img
            src={goal.imageUrl}
            alt={goal.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-neutral-400">
            <ImageIcon className="h-8 w-8 mb-1" />
            <span className="text-xs font-medium">Add Cover Image</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-white/50 hover:bg-white rounded-full"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <CardHeader className="p-4 pb-2 space-y-3">
        <div className="flex justify-between items-start">
          <AreaOfLifeBadge area={goal.area} />
          <StatusBadge status={status} />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg leading-tight">
            {goal.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Reward: {goal.reward}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {/* Progress & Deadline Row */}
        <div className="flex items-center justify-between mb-4 bg-neutral-50 p-2 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(goal.deadline, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">
              {Math.round(progress)}%
            </span>
            <CircularProgress percentage={progress} size={24} strokeWidth={4} />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">
            Steps to reach goal
          </p>
          {goal.steps.map((step) => (
            <GoalStepItem key={step.id} {...step} onToggle={handleToggleStep} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
