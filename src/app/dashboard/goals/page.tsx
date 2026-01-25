'use client';

import { useGoals } from '@/hooks/useData';
import { GoalCard } from '@/components/organisms/GoalCard';
import { AddGoalDialog } from '@/components/organisms/AddGoalDialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { Goal } from '@/types/goal';

export default function GoalsPage() {
  const { data: goals, isLoading } = useGoals();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            Goal Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            "A goal without a plan is just a wish." — Track your big wins here.
          </p>
        </div>
        <AddGoalDialog />
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
              ))
          : goals?.map((goal: Goal) => <GoalCard key={goal.id} goal={goal} />)}

        {!isLoading && (
          <div className="border-2 border-dashed border-neutral-200 rounded-lg flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[300px] bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-pointer group">
            <div className="h-12 w-12 rounded-full bg-white border shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Add Another Goal</h3>
            <p className="text-sm max-w-[200px] mt-2">
              Break down another big dream into small steps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
