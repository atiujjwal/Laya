import React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakIndicatorProps {
  streak: number;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ streak }) => {
  if (streak === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-bold",
        streak > 7 ? "text-orange-500" : "text-muted-foreground",
      )}
      title={`${streak} day streak`}
    >
      <Flame
        className={cn("w-3 h-3 fill-current", streak > 30 && "animate-pulse")}
      />
      <span>{streak}</span>
    </div>
  );
};
