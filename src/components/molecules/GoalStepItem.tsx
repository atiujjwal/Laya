import React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalStepItemProps {
  step: string;
  isDone: boolean;
  onToggle: () => void;
}

export const GoalStepItem: React.FC<GoalStepItemProps> = ({
  step,
  isDone,
  onToggle,
}) => {
  return (
    <div
      onClick={onToggle}
      className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer group transition-all"
    >
      <div
        className={cn(
          "mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
          isDone
            ? "bg-green-500 border-green-500 text-white"
            : "border-muted-foreground/30 group-hover:border-primary",
        )}
      >
        {isDone ? (
          <Check className="w-3 h-3" strokeWidth={3} />
        ) : (
          <Circle className="w-3 h-3 opacity-0 group-hover:opacity-50" />
        )}
      </div>
      <span
        className={cn(
          "text-sm transition-opacity",
          isDone && "line-through text-muted-foreground opacity-70",
        )}
      >
        {step}
      </span>
    </div>
  );
};
