'use client';

import { GoalCard, Goal } from '@/components/organisms/GoalCard';
import { AddGoalDialog } from '@/components/organisms/AddGoalDialog';
import { Separator } from '@/components/ui/separator';

// Dummy Data matching "BONUS - Goal Tracker.csv"
const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Pay Off Credit Card Debt',
    area: 'Finances',
    deadline: new Date('2026-06-01'),
    reward: 'Weekend Getaway',
    steps: [
      { id: 's1', text: 'Create budget spreadsheet', isCompleted: true },
      { id: 's2', text: 'Stop using card for 30 days', isCompleted: true },
      { id: 's3', text: 'Pay $500 extra this month', isCompleted: false },
    ],
  },
  {
    id: 'g2',
    title: 'Upskill for Promotion',
    area: 'Career',
    deadline: new Date('2026-09-01'),
    reward: 'New Laptop',
    steps: [
      { id: 'c1', text: 'Complete React Advanced Course', isCompleted: false },
      { id: 'c2', text: 'Build Portfolio Project', isCompleted: false },
    ],
  },
];

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
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

      {/* Goal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_GOALS.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}

        {/* Empty State / Call to Action Card */}
        <div className="border-2 border-dashed border-neutral-200 rounded-lg flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[300px] bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-full bg-white border shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Add Another Goal</h3>
          <p className="text-sm max-w-[200px] mt-2">
            Break down another big dream into small steps.
          </p>
        </div>
      </div>
    </div>
  );
}
