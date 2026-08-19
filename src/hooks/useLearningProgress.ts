import { useCallback, useEffect, useState } from "react";
import { getLearningDay, initialLearningSelection, weeks } from "@/data/weeks";
import type { LearningDay } from "@/types/learning";
import type {
  DailyStudyTime,
  MasteryProgress,
  StudyCategory,
  TaskProgress,
  TaskStatus,
} from "@/types/progress";

type DayTaskProgress = Record<string, TaskProgress>;
type SessionTaskProgress = Record<string, DayTaskProgress>;
type SessionMasteryProgress = Record<string, MasteryProgress>;
type SessionStudyTime = Record<string, DailyStudyTime>;

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

function createInitialMasteryProgress(day: LearningDay): MasteryProgress {
  return Object.fromEntries(
    day.passCriteria.map((criterion) => [criterion.id, false]),
  );
}

function createInitialStudyTime(): DailyStudyTime {
  return { learn: 0, practice: 0, build: 0, debug: 0 };
}

export function useLearningProgress() {
  const [currentWeek] = useState<number>(initialLearningSelection.week);
  const [currentDay, setCurrentDay] = useState<number>(initialLearningSelection.day);
  const day = getLearningDay(currentWeek, currentDay);
  const availableDays = weeks[currentWeek]?.days.map((learningDay) => learningDay.day) ?? [];
  const [sessionProgress, setSessionProgress] = useState<SessionTaskProgress>(() => (
    day ? { [day.id]: createInitialDayProgress(day) } : {}
  ));
  const [sessionMastery, setSessionMastery] = useState<SessionMasteryProgress>(() => (
    day ? { [day.id]: createInitialMasteryProgress(day) } : {}
  ));
  const [sessionStudyTime, setSessionStudyTime] = useState<SessionStudyTime>(() => (
    day ? { [day.id]: createInitialStudyTime() } : {}
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

    setSessionMastery((current) => {
      const currentDayMastery = current[day.id] ?? {};
      const initialDayMastery = createInitialMasteryProgress(day);
      const hasMissingCriteria = Object.keys(initialDayMastery).some(
        (criterionId) => currentDayMastery[criterionId] === undefined,
      );

      if (current[day.id] && !hasMissingCriteria) return current;

      return {
        ...current,
        [day.id]: {
          ...initialDayMastery,
          ...currentDayMastery,
        },
      };
    });

    setSessionStudyTime((current) => (
      current[day.id]
        ? current
        : { ...current, [day.id]: createInitialStudyTime() }
    ));
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

  const getPassCriterionState = useCallback((criterionId: string): boolean => {
    if (!day) return false;
    return sessionMastery[day.id]?.[criterionId] ?? false;
  }, [day, sessionMastery]);

  const togglePassCriterion = useCallback((criterionId: string) => {
    if (!day) return;

    setSessionMastery((current) => ({
      ...current,
      [day.id]: {
        ...current[day.id],
        [criterionId]: !(current[day.id]?.[criterionId] ?? false),
      },
    }));
  }, [day]);

  const updateStudyTime = useCallback((category: StudyCategory, minutes: number) => {
    if (!day || !Number.isFinite(minutes)) return;
    const safeMinutes = Math.max(0, minutes);

    setSessionStudyTime((current) => ({
      ...current,
      [day.id]: {
        ...(current[day.id] ?? createInitialStudyTime()),
        [category]: safeMinutes,
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
    getPassCriterionState,
    getTaskStatus,
    goToNextDay: () => {
      if (nextDay) setCurrentDay(nextDay.day);
    },
    goToPreviousDay: () => {
      if (previousDay) setCurrentDay(previousDay.day);
    },
    selectDay,
    studyTime: day ? (sessionStudyTime[day.id] ?? createInitialStudyTime()) : createInitialStudyTime(),
    togglePassCriterion,
    updateStudyTime,
    updateTaskStatus,
  };
}
