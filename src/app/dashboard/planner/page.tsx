"use client";

import { useDayPlan, useGeneratePlan } from "@/lib/hooks/use-api";
import { useLayaStore } from "@/lib/store";
import { PlannerTimeline } from "@/components/organisms/PlannerTimeline";
import { AIPlanCard } from "@/components/molecules/AIPlanCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function PlannerPage() {
  const { currentDate } = useLayaStore();
  const { data: plan, isLoading } = useDayPlan(currentDate);
  const generate = useGeneratePlan();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            Plan for {format(currentDate, "MMMM do")}
          </h1>
          <p className="text-muted-foreground">AI-Optimized Schedule</p>
        </div>

        <Button
          onClick={() => generate.mutate(currentDate)}
          disabled={generate.isPending}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {generate.isPending ? (
            "Generating..."
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Auto-Schedule Day
            </>
          )}
        </Button>
      </div>

      {/* AI Insight Card */}
      <AIPlanCard
        summary={plan?.summary}
        score={plan?.dayScore}
        isLoading={isLoading || generate.isPending}
      />

      {/* Vertical Timeline */}
      {plan?.schedule ? (
        <div className="bg-card border rounded-xl p-6">
          <PlannerTimeline schedule={plan.schedule} />
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground mb-4">
            No plan generated for this day yet.
          </p>
          <Button
            variant="outline"
            onClick={() => generate.mutate(currentDate)}
          >
            Generate Now
          </Button>
        </div>
      )}
    </div>
  );
}
