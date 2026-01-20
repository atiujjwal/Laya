import React from "react";

type PlanItem = {
  time: string;
  task: string;
  type: "habit" | "work" | "personal";
  duration: number; // minutes
};

export const PlannerTimeline = ({ schedule }: { schedule: PlanItem[] }) => {
  return (
    <div className="relative pl-8 border-l-2 border-muted space-y-6 my-4">
      {schedule.map((item, idx) => (
        <div key={idx} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[39px] top-0 bg-background border-2 border-primary w-4 h-4 rounded-full" />

          <div className="flex items-start justify-between bg-accent/30 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
            <div>
              <span className="text-xs font-mono text-muted-foreground">
                {item.time}
              </span>
              <h4 className="font-medium">{item.task}</h4>
            </div>
            <span className="text-xs text-muted-foreground">
              {item.duration} min
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
