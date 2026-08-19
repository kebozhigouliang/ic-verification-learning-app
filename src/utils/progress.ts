import type { LearningDay, LearningWeek } from "@/types/learning";
import type {
  DailyStudyTime,
  LearningProgress,
  StudyCategory,
  TaskStatus,
} from "@/types/progress";

export const progressTaskCategories: readonly StudyCategory[] = [
  "learn",
  "practice",
  "build",
  "debug",
];

export interface TaskProgressSummary {
  passed: number;
  total: number;
  percentage: number;
}

export interface MasteryProgressSummary {
  completed: number;
  total: number;
  percentage: number;
}

export interface DayProgressSummary {
  dayId: string;
  dayNumber: number;
  title: string;
  tasks: TaskProgressSummary;
  mastery: MasteryProgressSummary;
  studyMinutes: number;
  status: "pass" | "in_progress";
}

export interface StudyTimeSummary {
  total: number;
  byCategory: Record<StudyCategory, number>;
  byDay: Array<{ dayId: string; dayNumber: number; minutes: number }>;
}

export interface WeeklyProgressSummary {
  days: DayProgressSummary[];
  weekCompletion: TaskProgressSummary;
  tasksByCategory: Record<StudyCategory, TaskProgressSummary>;
  mastery: MasteryProgressSummary;
  coding: {
    tasks: TaskProgressSummary;
    hdlBitsCompleted: number;
  };
  studyTime: StudyTimeSummary;
  recentDays: DayProgressSummary[];
}

export function calculateTaskProgress(
  taskStatuses: readonly TaskStatus[],
): TaskProgressSummary {
  const total = taskStatuses.length;
  const passed = taskStatuses.filter((status) => status === "pass").length;
  const percentage = total === 0 ? 0 : Math.round((passed / total) * 100);

  return { passed, total, percentage };
}

export function calculateMasteryProgress(
  criterionStates: readonly boolean[],
): MasteryProgressSummary {
  const total = criterionStates.length;
  const completed = criterionStates.filter(Boolean).length;
  const percentage = total === 0 ? 0 : Math.floor((completed / total) * 100);

  return { completed, total, percentage };
}

export function calculateStudyTimeTotal(studyTime: DailyStudyTime): number {
  return studyTime.learn
    + studyTime.practice
    + studyTime.build
    + studyTime.debug;
}

function getCategoryTasks(
  day: LearningDay,
  category: StudyCategory,
): ReadonlyArray<{ id: string }> {
  return day[category];
}

function getTaskStatuses(
  day: LearningDay,
  progress: LearningProgress,
  category?: StudyCategory,
): TaskStatus[] {
  const tasks = category
    ? getCategoryTasks(day, category)
    : progressTaskCategories.flatMap((taskCategory) => getCategoryTasks(day, taskCategory));
  const dayProgress = progress.days[day.id];
  return tasks.map((task) => dayProgress?.taskStates[task.id]?.status ?? "todo");
}

function getCriterionStates(day: LearningDay, progress: LearningProgress): boolean[] {
  const criterionStates = progress.days[day.id]?.passCriteria;
  return day.passCriteria.map((criterion) => criterionStates?.[criterion.id] ?? false);
}

function getStudyTime(day: LearningDay, progress: LearningProgress): DailyStudyTime {
  return progress.days[day.id]?.studyTime ?? {
    learn: 0,
    practice: 0,
    build: 0,
    debug: 0,
  };
}

export function calculateDayProgress(
  day: LearningDay,
  progress: LearningProgress,
): DayProgressSummary {
  const tasks = calculateTaskProgress(getTaskStatuses(day, progress));
  const mastery = calculateMasteryProgress(getCriterionStates(day, progress));
  const taskComplete = tasks.total === 0 || tasks.passed === tasks.total;
  const masteryComplete = mastery.total === 0 || mastery.completed === mastery.total;
  const hasTrackedItems = tasks.total + mastery.total > 0;

  return {
    dayId: day.id,
    dayNumber: day.day,
    title: day.title,
    tasks,
    mastery,
    studyMinutes: calculateStudyTimeTotal(getStudyTime(day, progress)),
    status: hasTrackedItems && taskComplete && masteryComplete ? "pass" : "in_progress",
  };
}

export function calculateWeeklyTaskProgress(
  week: LearningWeek,
  progress: LearningProgress,
): Record<StudyCategory, TaskProgressSummary> {
  return Object.fromEntries(progressTaskCategories.map((category) => {
    const statuses = week.days.flatMap((day) => getTaskStatuses(day, progress, category));
    return [category, calculateTaskProgress(statuses)];
  })) as Record<StudyCategory, TaskProgressSummary>;
}

export function calculateWeeklyMasteryProgress(
  week: LearningWeek,
  progress: LearningProgress,
): MasteryProgressSummary {
  return calculateMasteryProgress(
    week.days.flatMap((day) => getCriterionStates(day, progress)),
  );
}

export function calculateStudyTimeSummary(
  week: LearningWeek,
  progress: LearningProgress,
): StudyTimeSummary {
  const byCategory: Record<StudyCategory, number> = {
    learn: 0,
    practice: 0,
    build: 0,
    debug: 0,
  };
  const byDay = week.days.map((day) => {
    const studyTime = getStudyTime(day, progress);
    progressTaskCategories.forEach((category) => {
      byCategory[category] += studyTime[category];
    });
    return {
      dayId: day.id,
      dayNumber: day.day,
      minutes: calculateStudyTimeTotal(studyTime),
    };
  });

  return {
    total: calculateStudyTimeTotal(byCategory),
    byCategory,
    byDay,
  };
}

export function calculateRecentDays(
  week: LearningWeek,
  progress: LearningProgress,
  limit = 7,
): DayProgressSummary[] {
  return week.days
    .slice(-Math.max(0, limit))
    .reverse()
    .map((day) => calculateDayProgress(day, progress));
}

export function calculateWeeklyProgress(
  week: LearningWeek,
  progress: LearningProgress,
): WeeklyProgressSummary {
  const days = week.days.map((day) => calculateDayProgress(day, progress));
  const tasksByCategory = calculateWeeklyTaskProgress(week, progress);
  const weekCompletion = calculateTaskProgress(
    days.map((day) => day.status === "pass" ? "pass" : "doing"),
  );

  return {
    days,
    weekCompletion,
    tasksByCategory,
    mastery: calculateWeeklyMasteryProgress(week, progress),
    coding: {
      tasks: tasksByCategory.build,
      hdlBitsCompleted: progress.hdlBitsCompleted,
    },
    studyTime: calculateStudyTimeSummary(week, progress),
    recentDays: calculateRecentDays(week, progress),
  };
}
