import React from "react";
// import { Badge } from "@/components/ui/Badge";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HabitRowHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  frequency: string;
  streak: number;
  color: string;
}

export const HabitRowHeader: React.FC<HabitRowHeaderProps> = ({
  title,
  description,
  icon,
  frequency,
  streak,
  color,
}) => {
  return (
    <div className="flex items-center justify-between w-64 p-3 border-r bg-background h-[50px]">
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className="w-1 h-8 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon || "📝"}</span>
            <span className="font-medium truncate text-sm" title={title}>
              {title}
            </span>
          </div>
          {streak > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              🔥 {streak} day streak
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            {" "}
            <Edit2 className="w-3 h-3 mr-2" /> Edit{" "}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            {" "}
            <Trash2 className="w-3 h-3 mr-2" /> Archive{" "}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
