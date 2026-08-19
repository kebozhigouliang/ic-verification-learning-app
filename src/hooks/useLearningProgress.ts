import { useCallback, useEffect, useState } from "react";
import { getLearningDay, initialLearningSelection, weeks } from "@/data/weeks";
import type { LearningDay } from "@/types/learning";
import type { TaskProgress, TaskStatus } from "@/types/progress";

type DayTaskProgress = Record<string, TaskProgress>;
type SessionTaskProgress = Record<string, DayTaskProgress>;

function getTaskIds(day: LearningDay): string[] {
  return [
    ...day.learn,
    ...day.practice,
    ...day.build,
    ...day.debug,
  ].map((task) => task.id);
}

function createInitialDayProgress(day: LearningDay): DayTaskProgress {
  return Object.fromEntries(
    getTaskIds(day).map((taskId) => [taskId, { status: "todo" }]),
  );
}

export function useLearningProgress() {
  const [currentWeek] = useState<number>(initialLearningSelection.week);
  const [currentDay, setCurrentDay] = useState<number>(initialLearningSelection.day);
  const day = getLearningDay(currentWeek, currentDay);
  const availableDays = weeks[currentWeek]?.days.map((learningDay) => learningDay.day) ?? [];
  const [sessionProgress, setSessionProgress] = useState<SessionTaskProgress>(() => (
    day ? { [day.id]: createInitialDayProgress(day) } : {}
  ));

  useEffect(() => {
    if (!day) return;

    setSessionProgress((current) => {
      const currentDayProgress = current[day.id] ?? {};
      const initialDayProgress = createInitialDayProgress(day);
      const hasMissingTasks = Object.keys(initialDayProgress).some(
        (taskId) => currentDayProgress[taskId] === undefined,
      );

      if (current[day.id] && !hasMissingTasks) return current;

      return {
        ...current,
        [day.id]: {
          ...initialDayProgress,
          ...currentDayProgress,
        },
      };
    });
  }, [day]);

  const getTaskStatus = useCallback((taskId: string): TaskStatus => {
    if (!day) return "todo";
    return sessionProgress[day.id]?.[taskId]?.status ?? "todo";
  }, [day, sessionProgress]);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    if (!day) return;

    setSessionProgress((current) => ({
      ...current,
      [day.id]: {
        ...current[day.id],
        [taskId]: {
          ...current[day.id]?.[taskId],
          status,
        },
      },
    }));
  }, [day]);

  const selectDay = useCallback((dayNumber: number) => {
    const selectedDay = getLearningDay(currentWeek, dayNumber);
    if (selectedDay) setCurrentDay(selectedDay.day);
  }, [currentWeek]);

  const previousDay = getLearningDay(currentWeek, currentDay - 1);
  const nextDay = getLearningDay(currentWeek, currentDay + 1);

  return {
    availableDays,
    canGoNext: nextDay !== undefined,
    canGoPrevious: previousDay !== undefined,
    currentDay,
    currentLearningDay: day,
    currentWeek,
    getTaskStatus,
    goToNextDay: () => {
      if (nextDay) setCurrentDay(nextDay.day);
    },
    goToPreviousDay: () => {
      if (previousDay) setCurrentDay(previousDay.day);
    },
    selectDay,
    updateTaskStatus,
  };
}
