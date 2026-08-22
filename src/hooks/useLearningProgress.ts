import { useCallback, useEffect, useState } from "react";
import { getLearningDay, initialLearningSelection, weeks } from "@/data/weeks";
import { loadAppData, resetAppData, saveAppData } from "@/storage/repository";
import type { LearningDay } from "@/types/learning";
import type { StudySession } from "@/types/study-session";
import type {
  BuildVerification,
  DailyStudyTime,
  DayProgress,
  LearningProgress,
  MasteryProgress,
  ResourceProgress,
  SoftwareProgress,
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

function createInitialResourceStates(day: LearningDay): Record<string, ResourceProgress> {
  return Object.fromEntries(day.learn.map((resource) => [resource.id, {
    resourceOpened: false,
    resourceCompleted: false,
  }]));
}

function createInitialSoftwareStates(day: LearningDay): Record<string, SoftwareProgress> {
  return Object.fromEntries((day.softwareRequirements ?? []).map((software) => [
    software.id,
    { status: "todo" },
  ]));
}

function createInitialBuildVerifications(day: LearningDay): Record<string, BuildVerification> {
  return Object.fromEntries(day.build.map((buildTask) => [buildTask.id, {
    simulationSuccess: false,
  }]));
}

function createInitialStudyTime(): DailyStudyTime {
  return { learn: 0, practice: 0, build: 0, debug: 0 };
}

function getLearningDayById(dayId: string): LearningDay | undefined {
  return Object.values(weeks)
    .flatMap((week) => week.days)
    .find((learningDay) => learningDay.id === dayId);
}

function createInitialDayProgress(day: LearningDay): DayProgress {
  return {
    taskStates: createInitialTaskStates(day),
    resourceStates: createInitialResourceStates(day),
    softwareStates: createInitialSoftwareStates(day),
    buildVerifications: createInitialBuildVerifications(day),
    passCriteria: createInitialMasteryProgress(day),
    studyTime: createInitialStudyTime(),
  };
}

function mergeDayProgress(day: LearningDay, current?: DayProgress): DayProgress {
  const defaults = createInitialDayProgress(day);
  if (!current) return defaults;

  const resourceStates = Object.fromEntries(day.learn.map((resource) => {
    const existing = current.resourceStates?.[resource.id];
    if (existing) return [resource.id, existing];

    const legacyStatus = current.taskStates?.[resource.id]?.status ?? "todo";
    return [resource.id, {
      resourceOpened: legacyStatus !== "todo",
      resourceCompleted: legacyStatus === "pass",
    }];
  }));

  return {
    ...defaults,
    ...current,
    taskStates: { ...defaults.taskStates, ...current.taskStates },
    resourceStates: { ...defaults.resourceStates, ...resourceStates },
    softwareStates: { ...defaults.softwareStates, ...current.softwareStates },
    buildVerifications: { ...defaults.buildVerifications, ...current.buildVerifications },
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
      const latestAppData = loadAppData();
      saveAppData({
        ...latestAppData,
        progress: {
          ...latestAppData.progress,
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

  const getResourceProgress = useCallback((resourceId: string): ResourceProgress => {
    if (!day) return { resourceOpened: false, resourceCompleted: false };
    return dayProgressById[day.id]?.resourceStates[resourceId]
      ?? { resourceOpened: false, resourceCompleted: false };
  }, [day, dayProgressById]);

  const markResourceOpened = useCallback((resourceId: string) => {
    if (!day) return;
    const now = new Date().toISOString();
    setDayProgressById((current) => {
      const currentDayProgress = mergeDayProgress(day, current[day.id]);
      const taskProgress = currentDayProgress.taskStates[resourceId] ?? { status: "todo" };
      return {
        ...current,
        [day.id]: {
          ...currentDayProgress,
          resourceStates: {
            ...currentDayProgress.resourceStates,
            [resourceId]: {
              ...currentDayProgress.resourceStates[resourceId],
              resourceOpened: true,
              openedAt: currentDayProgress.resourceStates[resourceId]?.openedAt ?? now,
            },
          },
          taskStates: {
            ...currentDayProgress.taskStates,
            [resourceId]: taskProgress.status === "todo"
              ? { ...taskProgress, status: "doing" }
              : taskProgress,
          },
        },
      };
    });
  }, [day]);

  const setResourceCompleted = useCallback((resourceId: string, completed: boolean) => {
    if (!day) return;
    const now = new Date().toISOString();
    setDayProgressById((current) => {
      const currentDayProgress = mergeDayProgress(day, current[day.id]);
      const resourceProgress = currentDayProgress.resourceStates[resourceId]
        ?? { resourceOpened: false, resourceCompleted: false };
      return {
        ...current,
        [day.id]: {
          ...currentDayProgress,
          resourceStates: {
            ...currentDayProgress.resourceStates,
            [resourceId]: {
              ...resourceProgress,
              resourceOpened: completed || resourceProgress.resourceOpened,
              resourceCompleted: completed,
              openedAt: completed
                ? (resourceProgress.openedAt ?? now)
                : resourceProgress.openedAt,
              completedAt: completed ? now : undefined,
            },
          },
          taskStates: {
            ...currentDayProgress.taskStates,
            [resourceId]: {
              status: completed
                ? "pass"
                : resourceProgress.resourceOpened ? "doing" : "todo",
              completedAt: completed ? now : undefined,
            },
          },
        },
      };
    });
  }, [day]);

  const getSoftwareStatus = useCallback((softwareId: string): TaskStatus => {
    if (!day) return "todo";
    return dayProgressById[day.id]?.softwareStates[softwareId]?.status ?? "todo";
  }, [day, dayProgressById]);

  const updateSoftwareStatus = useCallback((softwareId: string, status: TaskStatus) => {
    if (!day) return;
    setDayProgressById((current) => {
      const currentDayProgress = mergeDayProgress(day, current[day.id]);
      return {
        ...current,
        [day.id]: {
          ...currentDayProgress,
          softwareStates: {
            ...currentDayProgress.softwareStates,
            [softwareId]: {
              status,
              completedAt: status === "pass" ? new Date().toISOString() : undefined,
            },
          },
        },
      };
    });
  }, [day]);

  const getBuildVerification = useCallback((buildId: string): BuildVerification => {
    if (!day) return { simulationSuccess: false };
    return dayProgressById[day.id]?.buildVerifications[buildId]
      ?? { simulationSuccess: false };
  }, [day, dayProgressById]);

  const updateBuildVerification = useCallback((buildId: string, simulationSuccess: boolean) => {
    if (!day) return;
    const now = new Date().toISOString();
    setDayProgressById((current) => {
      const currentDayProgress = mergeDayProgress(day, current[day.id]);
      const taskProgress = currentDayProgress.taskStates[buildId] ?? { status: "todo" };
      return {
        ...current,
        [day.id]: {
          ...currentDayProgress,
          buildVerifications: {
            ...currentDayProgress.buildVerifications,
            [buildId]: {
              simulationSuccess,
              verifiedAt: simulationSuccess ? now : undefined,
            },
          },
          taskStates: {
            ...currentDayProgress.taskStates,
            [buildId]: {
              status: simulationSuccess
                ? (taskProgress.status === "todo" ? "doing" : taskProgress.status)
                : (taskProgress.status === "pass" ? "doing" : taskProgress.status),
              completedAt: simulationSuccess && taskProgress.status === "pass"
                ? taskProgress.completedAt
                : undefined,
            },
          },
        },
      };
    });
  }, [day]);

  const completeBuildTask = useCallback((buildId: string) => {
    if (!day) return;
    const now = new Date().toISOString();
    setDayProgressById((current) => {
      const currentDayProgress = mergeDayProgress(day, current[day.id]);
      if (!currentDayProgress.buildVerifications[buildId]?.simulationSuccess) return current;

      return {
        ...current,
        [day.id]: {
          ...currentDayProgress,
          taskStates: {
            ...currentDayProgress.taskStates,
            [buildId]: { status: "pass", completedAt: now },
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

  const recordStudySession = useCallback((session: StudySession) => {
    if (!session.relatedDayId) return;
    const sessionDay = getLearningDayById(session.relatedDayId);
    if (!sessionDay) return;
    const category = session.type.toLowerCase() as StudyCategory;
    const minutes = Math.max(1, Math.ceil(session.duration / 60));

    setDayProgressById((current) => {
      const currentDayProgress = mergeDayProgress(sessionDay, current[sessionDay.id]);
      return {
        ...current,
        [sessionDay.id]: {
          ...currentDayProgress,
          studyTime: {
            ...currentDayProgress.studyTime,
            [category]: currentDayProgress.studyTime[category] + minutes,
          },
        },
      };
    });
  }, []);

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
  const learningProgress: LearningProgress = {
    ...appDataBase.progress,
    currentWeek,
    currentDay,
    days: dayProgressById,
  };
  const currentDayProgress = day
    ? mergeDayProgress(day, dayProgressById[day.id])
    : undefined;

  return {
    availableDays,
    canGoNext: nextDay !== undefined,
    canGoPrevious: previousDay !== undefined,
    completeBuildTask,
    currentDay,
    currentLearningDay: day,
    currentDayProgress,
    currentWeek,
    getBuildVerification,
    getPassCriterionState,
    getResourceProgress,
    getSoftwareStatus,
    getTaskStatus,
    goToNextDay: () => {
      if (nextDay) setCurrentDay(nextDay.day);
    },
    goToPreviousDay: () => {
      if (previousDay) setCurrentDay(previousDay.day);
    },
    learningProgress,
    markResourceOpened,
    recordStudySession,
    replaceAppData,
    resetProgress,
    selectDay,
    studyTime,
    setResourceCompleted,
    togglePassCriterion,
    updateStudyTime,
    updateBuildVerification,
    updateSoftwareStatus,
    updateTaskStatus,
  };
}
