import { useCallback, useEffect, useState } from "react";
import { getLearningDay, initialLearningSelection, weeks } from "@/data/weeks";
import { loadAppData, resetAppData, saveAppData } from "@/storage/repository";
import type { LearningDay } from "@/types/learning";
import type {
  DailyStudyTime,
  DayProgress,
  MasteryProgress,
  StudyCategory,
  TaskProgress,
  TaskStatus,
} from "@/types/progress";

function getTaskIds(day: LearningDay): string[] {
  return [
    ...day.learn,
    ...day.practice,
    ...day.build,
    ...day.debug,
  ].map((task) => task.id);
}

function createInitialTaskStates(day: LearningDay): Record<string, TaskProgress> {
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

function createInitialDayProgress(day: LearningDay): DayProgress {
  return {
    taskStates: createInitialTaskStates(day),
    passCriteria: createInitialMasteryProgress(day),
    studyTime: createInitialStudyTime(),
  };
}

function mergeDayProgress(day: LearningDay, current?: DayProgress): DayProgress {
  const defaults = createInitialDayProgress(day);
  if (!current) return defaults;

  return {
    ...defaults,
    ...current,
    taskStates: { ...defaults.taskStates, ...current.taskStates },
    passCriteria: { ...defaults.passCriteria, ...current.passCriteria },
    studyTime: { ...defaults.studyTime, ...current.studyTime },
  };
}

export function useLearningProgress() {
  const [appDataBase, setAppDataBase] = useState(loadAppData);
  const storedDay = getLearningDay(
    appDataBase.progress.currentWeek,
    appDataBase.progress.currentDay,
  );
  const initialPosition = storedDay
    ? { week: storedDay.week, day: storedDay.day }
    : initialLearningSelection;

  const [currentWeek, setCurrentWeek] = useState<number>(initialPosition.week);
  const [currentDay, setCurrentDay] = useState<number>(initialPosition.day);
  const day = getLearningDay(currentWeek, currentDay);
  const availableDays = weeks[currentWeek]?.days.map((learningDay) => learningDay.day) ?? [];
  const [dayProgressById, setDayProgressById] = useState<Record<string, DayProgress>>(() => (
    day
      ? {
        ...appDataBase.progress.days,
        [day.id]: mergeDayProgress(day, appDataBase.progress.days[day.id]),
      }
      : appDataBase.progress.days
  ));

  useEffect(() => {
    if (!day) return;
    setDayProgressById((current) => ({
      ...current,
      [day.id]: mergeDayProgress(day, current[day.id]),
    }));
  }, [day]);

  useEffect(() => {
    try {
      saveAppData({
        ...appDataBase,
        progress: {
          ...appDataBase.progress,
          currentWeek,
          currentDay,
          days: dayProgressById,
        },
      });
    } catch {
      // Keep the in-memory session usable when browser storage is unavailable.
    }
  }, [appDataBase, currentDay, currentWeek, dayProgressById]);

  const getTaskStatus = useCallback((taskId: string): TaskStatus => {
    if (!day) return "todo";
    return dayProgressById[day.id]?.taskStates[taskId]?.status ?? "todo";
  }, [day, dayProgressById]);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    if (!day) return;
    setDayProgressById((current) => {
      const currentDayProgress = mergeDayProgress(day, current[day.id]);
      return {
        ...current,
        [day.id]: {
          ...currentDayProgress,
          taskStates: {
            ...currentDayProgress.taskStates,
            [taskId]: {
              ...currentDayProgress.taskStates[taskId],
              status,
            },
          },
        },
      };
    });
  }, [day]);

  const getPassCriterionState = useCallback((criterionId: string): boolean => {
    if (!day) return false;
    return dayProgressById[day.id]?.passCriteria[criterionId] ?? false;
  }, [day, dayProgressById]);

  const togglePassCriterion = useCallback((criterionId: string) => {
    if (!day) return;
    setDayProgressById((current) => {
      const currentDayProgress = mergeDayProgress(day, current[day.id]);
      return {
        ...current,
        [day.id]: {
          ...currentDayProgress,
          passCriteria: {
            ...currentDayProgress.passCriteria,
            [criterionId]: !currentDayProgress.passCriteria[criterionId],
          },
        },
      };
    });
  }, [day]);

  const updateStudyTime = useCallback((category: StudyCategory, minutes: number) => {
    if (!day || !Number.isFinite(minutes)) return;
    const safeMinutes = Math.max(0, minutes);

    setDayProgressById((current) => {
      const currentDayProgress = mergeDayProgress(day, current[day.id]);
      return {
        ...current,
        [day.id]: {
          ...currentDayProgress,
          studyTime: {
            ...currentDayProgress.studyTime,
            [category]: safeMinutes,
          },
        },
      };
    });
  }, [day]);

  const selectDay = useCallback((dayNumber: number) => {
    const selectedDay = getLearningDay(currentWeek, dayNumber);
    if (selectedDay) setCurrentDay(selectedDay.day);
  }, [currentWeek]);

  const replaceAppData = useCallback((nextData: typeof appDataBase) => {
    const importedDay = getLearningDay(
      nextData.progress.currentWeek,
      nextData.progress.currentDay,
    );
    const nextPosition = importedDay
      ? { week: importedDay.week, day: importedDay.day }
      : initialLearningSelection;
    const nextDays = importedDay
      ? {
        ...nextData.progress.days,
        [importedDay.id]: mergeDayProgress(importedDay, nextData.progress.days[importedDay.id]),
      }
      : nextData.progress.days;

    setAppDataBase(nextData);
    setCurrentWeek(nextPosition.week);
    setCurrentDay(nextPosition.day);
    setDayProgressById(nextDays);
  }, []);

  const resetProgress = useCallback(() => {
    const resetData = resetAppData();
    replaceAppData(resetData);
    return resetData;
  }, [replaceAppData]);

  const previousDay = getLearningDay(currentWeek, currentDay - 1);
  const nextDay = getLearningDay(currentWeek, currentDay + 1);
  const studyTime = day
    ? (dayProgressById[day.id]?.studyTime ?? createInitialStudyTime())
    : createInitialStudyTime();

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
    replaceAppData,
    resetProgress,
    selectDay,
    studyTime,
    togglePassCriterion,
    updateStudyTime,
    updateTaskStatus,
  };
}
