import type { TaskStatus } from "@/types/progress";

export interface TaskProgressSummary {
  passed: number;
  total: number;
  percentage: number;
}

export function calculateTaskProgress(
  taskStatuses: readonly TaskStatus[],
): TaskProgressSummary {
  const total = taskStatuses.length;
  const passed = taskStatuses.filter((status) => status === "pass").length;
  const percentage = total === 0 ? 0 : Math.round((passed / total) * 100);

  return { passed, total, percentage };
}
