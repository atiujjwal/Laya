"use client";

import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { StatusCheckbox } from "../atoms/StatusCheckbox";
import { HabitRowHeader } from "../molecules/HabitRowHeader";
import { DateColumnHeader } from "../molecules/DateColumnHeader";
import { eachDayOfInterval, endOfMonth, startOfMonth } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Ensure you have React Query setup
import { LogStatus } from "@prisma/client";

// Mock types for props - replace with actual Prisma types
type HabitWithLogs = {
  id: string;
  title: string;
  color: string;
  logs: Record<string, LogStatus>; // key: "YYYY-MM-DD"
};

interface GridProps {
  habits: HabitWithLogs[];
  currentDate: Date;
}

export const VirtualHabitGrid: React.FC<GridProps> = ({
  habits,
  currentDate,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // 1. Generate Dates for Current Month
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // 2. Setup Virtualizer for Rows (Habits)
  const rowVirtualizer = useVirtualizer({
    count: habits.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Height of each row
    overscan: 5,
  });

  // 3. Optimistic Mutation Handler
  const toggleMutation = useMutation({
    mutationFn: async (payload: {
      habitId: string;
      date: string;
      status: LogStatus;
    }) => {
      await fetch("/api/habits/log", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onMutate: async ({ habitId, date, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["habits"] });
      const previousHabits = queryClient.getQueryData(["habits"]);

      // Optimistically update cache
      queryClient.setQueryData(["habits"], (old: any) => {
        return old.map((h: any) =>
          h.id === habitId ? { ...h, logs: { ...h.logs, [date]: status } } : h,
        );
      });
      return { previousHabits };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["habits"], context?.previousHabits);
    },
  });

  const handleToggle = (
    habitId: string,
    dateStr: string,
    currentStatus: LogStatus | undefined,
  ) => {
    // Cycle: Undefined -> COMPLETED -> SKIPPED -> Undefined
    let nextStatus: LogStatus | null = "COMPLETED";
    if (currentStatus === "COMPLETED") nextStatus = "SKIPPED";
    if (currentStatus === "SKIPPED") nextStatus = null; // Delete log effectively

    toggleMutation.mutate({
      habitId,
      date: dateStr,
      status: nextStatus as LogStatus,
    });
  };

  return (
    <div className="border rounded-lg shadow-sm bg-background flex flex-col h-[600px]">
      {/* 1. Sticky Header Row (Dates) */}
      <div className="flex border-b z-20 shadow-sm sticky top-0 bg-background">
        <div className="w-64 min-w-[256px] p-4 font-bold text-muted-foreground border-r bg-muted/10">
          Habit
        </div>
        <div className="flex overflow-hidden">
          {days.map((day) => (
            <DateColumnHeader key={day.toISOString()} date={day} />
          ))}
        </div>
      </div>

      {/* 2. Virtualized Body */}
      <div ref={parentRef} className="flex-1 overflow-auto relative">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const habit = habits[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                className="flex absolute top-0 left-0 w-full group hover:bg-muted/5 transition-colors"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {/* Sticky Left Column (Habit Info) */}
                <div className="sticky left-0 z-10">
                  <HabitRowHeader
                    title={habit.title}
                    color={habit.color}
                    frequency="Daily"
                    streak={0}
                  />
                </div>

                {/* Scrollable Checkboxes */}
                {days.map((day) => {
                  const dateStr = day.toISOString().split("T")[0];
                  const status = habit.logs[dateStr]; // Needs efficient lookup map
                  return (
                    <div
                      key={`${habit.id}-${dateStr}`}
                      className="min-w-[50px] h-[50px] border-r border-b flex items-center justify-center"
                    >
                      <StatusCheckbox
                        status={status}
                        onClick={() => handleToggle(habit.id, dateStr, status)}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
