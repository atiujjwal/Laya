import React from "react";
import { Sparkles, Trophy } from "lucide-react";
import { Badge } from "../atoms/Badge";

interface AIPlanCardProps {
  summary: string | null;
  score: number | null;
  focus?: string;
  isLoading?: boolean;
}

export const AIPlanCard: React.FC<AIPlanCardProps> = ({
  summary,
  score,
  focus,
  isLoading,
}) => {
  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-xl w-full" />;
  }

  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Sparkles className="w-24 h-24 text-indigo-500" />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-white/80 dark:bg-black/40 backdrop-blur-sm"
          >
            <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
            AI Coach
          </Badge>
          {focus && (
            <span className="text-xs text-muted-foreground">
              Focus: {focus}
            </span>
          )}
        </div>

        {score !== null && (
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
            <Trophy className="w-4 h-4" />
            <span>Score: {score}/100</span>
          </div>
        )}
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed relative z-10">
        {summary}
      </p>
    </div>
  );
};
