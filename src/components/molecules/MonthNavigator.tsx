import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { IconButton } from "../atoms/IconButton";
import { format } from "date-fns";

interface MonthNavigatorProps {
  currentDate: Date;
  onNext: () => void;
  onPrev: () => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentDate,
  onNext,
  onPrev,
}) => {
  return (
    <div className="flex items-center gap-2 bg-background border rounded-lg p-1 shadow-sm">
      <IconButton onClick={onPrev} size="sm">
        <ChevronLeft className="w-4 h-4" />
      </IconButton>

      <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center font-semibold text-sm">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {format(currentDate, "MMMM yyyy")}
      </div>

      <IconButton onClick={onNext} size="sm">
        <ChevronRight className="w-4 h-4" />
      </IconButton>
    </div>
  );
};
