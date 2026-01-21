import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogStatus } from "@prisma/client";

// --- HABITS ---
export function useHabits(date: Date) {
  return useQuery({
    queryKey: ["habits", date.getMonth(), date.getFullYear()],
    queryFn: async () => {
      const res = await fetch(
        `/api/habits/logs?startDate=${date.toISOString()}&endDate=${date.toISOString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch habits");
      return res.json();
    },
  });
}

export function useToggleHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      date,
      status,
    }: {
      habitId: string;
      date: string;
      status: LogStatus | null;
    }) => {
      // Upsert Log API
      const res = await fetch("/api/habits/log", {
        method: "POST",
        body: JSON.stringify({
          habitId,
          date,
          completed: status === "COMPLETED",
          status,
          value: 1,
        }),
      });
      return res.json();
    },
    // Optimistic Update Logic
    onMutate: async (newLog) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });
      const previousHabits = queryClient.getQueryData(["habits"]);

      // Manually update the cache before API responds for "Instant" feel
      queryClient.setQueryData(["habits"], (old: any) => {
        // Logic to update deep nested object would go here
        return old;
      });

      return { previousHabits };
    },
    onError: (err, newLog, context) => {
      queryClient.setQueryData(["habits"], context?.previousHabits);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

// --- GOALS ---
export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => (await fetch("/api/goals")).json(),
  });
}

// --- PLANNER ---
export function useDayPlan(date: Date) {
  return useQuery({
    queryKey: ["plan", date.toISOString().split("T")[0]],
    queryFn: async () => {
      const res = await fetch(`/api/planner?date=${date.toISOString()}`);
      return res.json();
    },
  });
}

export function useGeneratePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: Date) => {
      const res = await fetch("/api/planner/generate", {
        method: "POST",
        body: JSON.stringify({ date: date.toISOString() }),
      });
      return res.json();
    },
    onSuccess: (_, date) => {
      queryClient.invalidateQueries({
        queryKey: ["plan", date.toISOString().split("T")[0]],
      });
    },
  });
}
