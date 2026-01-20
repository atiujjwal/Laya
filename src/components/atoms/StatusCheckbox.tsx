import React from "react";
import { cn } from "@/lib/utils";
import { Check, X, Minus } from "lucide-react";
import { LogStatus } from "@prisma/client"; // Ensure this matches your schema

interface StatusCheckboxProps {
  status: LogStatus | null; // null = Not logged yet
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export const StatusCheckbox: React.FC<StatusCheckboxProps> = ({
  status,
  onClick,
  className,
  disabled,
}) => {
  // Cycle Logic: Null -> Completed -> Skipped -> Failed -> Null
  // This logic is handled by the parent, but visually we render based on prop

  const getStatusStyles = () => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500 border-green-600 text-white";
      case "SKIPPED":
        return "bg-gray-300 border-gray-400 text-gray-600";
      case "FAILED":
        return "bg-red-500 border-red-600 text-white";
      default:
        return "bg-background border-muted-foreground/30 hover:bg-accent";
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-6 w-6 rounded-md border flex items-center justify-center transition-all duration-100 focus:ring-2 focus:ring-ring focus:outline-none",
        getStatusStyles(),
        className,
      )}
      aria-label={`Toggle status. Current: ${status || "Empty"}`}
    >
      {status === "COMPLETED" && <Check className="h-4 w-4" strokeWidth={3} />}
      {status === "FAILED" && <X className="h-4 w-4" strokeWidth={3} />}
      {status === "SKIPPED" && <Minus className="h-4 w-4" strokeWidth={3} />}
    </button>
  );
};
