import { cn } from "@/lib/utils";
import { isToday, isWeekend, format } from "date-fns";

interface DateColumnHeaderProps {
  date: Date;
}

export const DateColumnHeader: React.FC<DateColumnHeaderProps> = ({ date }) => {
  const isCurrentDay = isToday(date);
  const isWeekendDay = isWeekend(date);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-w-[50px] h-14 border-b border-r text-xs transition-colors",
        isCurrentDay ? "bg-primary/10" : "bg-background",
        isWeekendDay && !isCurrentDay && "bg-muted/30",
      )}
    >
      <span
        className={cn(
          "font-medium uppercase",
          isCurrentDay ? "text-primary" : "text-muted-foreground",
        )}
      >
        {format(date, "EEE")}
      </span>
      <div
        className={cn(
          "h-6 w-6 flex items-center justify-center rounded-full mt-1",
          isCurrentDay && "bg-primary text-primary-foreground font-bold",
        )}
      >
        {format(date, "d")}
      </div>
    </div>
  );
};
