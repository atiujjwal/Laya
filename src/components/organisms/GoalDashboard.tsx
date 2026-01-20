import React from "react";
import { ProgressBar } from "../atoms/ProgressBar";
import { CheckCircle2, Circle } from "lucide-react";

interface Step {
  step: string;
  done: boolean;
}

interface GoalCardProps {
  title: string;
  category: string;
  progress: number;
  steps: Step[];
  daysLeft: number;
}

const GoalCard: React.FC<GoalCardProps> = ({
  title,
  category,
  progress,
  steps,
  daysLeft,
}) => (
  <div className="border rounded-xl p-5 bg-card hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {category}
      </span>
      <span className="text-xs bg-secondary px-2 py-1 rounded-full">
        {daysLeft} days left
      </span>
    </div>

    <h3 className="font-semibold text-lg mb-4">{title}</h3>

    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <ProgressBar value={progress} className="h-2" />
    </div>

    <div className="space-y-2">
      {steps.slice(0, 3).map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          {s.done ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
          <span className={s.done ? "line-through opacity-70" : ""}>
            {s.step}
          </span>
        </div>
      ))}
      {steps.length > 3 && (
        <div className="text-xs text-center pt-2 text-muted-foreground">
          +{steps.length - 3} more steps
        </div>
      )}
    </div>
  </div>
);

export const GoalDashboard = ({ goals }: { goals: GoalCardProps[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {goals.map((g, i) => (
        <GoalCard key={i} {...g} />
      ))}
    </div>
  );
};
