"use client";

import { useGoals } from "@/lib/hooks/use-api";
import { GoalDashboard } from "@/components/organisms/GoalDashboard";
import { Button } from "@/components/atoms/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/atoms/Skeleton";

export default function GoalsPage() {
  const { data: goals, isLoading } = useGoals();

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton className="h-64 w-full" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-muted-foreground">
            Track your long-term milestones.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> New Goal
        </Button>
      </div>

      <GoalDashboard goals={goals || []} />
    </div>
  );
}
