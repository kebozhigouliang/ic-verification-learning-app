import type { LearningDay, LearningWeek } from "@/types/learning";
import type {
  DailyStudyTime,
  DayProgress,
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

export interface DayCompletionSummary {
  complete: boolean;
  hasActivity: boolean;
  completedRequirements: number;
  totalRequirements: number;
  percentage: number;
  requiredResources: TaskProgressSummary;
  requiredSoftware: TaskProgressSummary;
  practice: TaskProgressSummary;
  build: TaskProgressSummary;
  mastery: MasteryProgressSummary;
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

export function calculateDayCompletion(
  day: LearningDay,
  dayProgress?: DayProgress,
): DayCompletionSummary {
  const requiredResources = day.learn.filter((resource) => resource.required !== false);
  const requiredSoftware = (day.softwareRequirements ?? []).filter((software) => software.required);
  const requiredPractice = day.practice.filter((task) => task.required !== false);

  const resourceSummary = calculateTaskProgress(requiredResources.map((resource) => (
    dayProgress?.resourceStates[resource.id]?.resourceCompleted ? "pass" : "todo"
  )));
  const softwareSummary = calculateTaskProgress(requiredSoftware.map((software) => (
    dayProgress?.softwareStates[software.id]?.status ?? "todo"
  )));
  const practiceSummary = calculateTaskProgress(requiredPractice.map((task) => (
    dayProgress?.taskStates[task.id]?.status ?? "todo"
  )));
  const buildSummary = calculateTaskProgress(day.build.map((task) => (
    (dayProgress?.taskStates[task.id]?.status === "pass"
      && (!task.verificationMethod
        || dayProgress?.buildVerifications[task.id]?.simulationSuccess))
      ? "pass"
      : (dayProgress?.taskStates[task.id]?.status ?? "todo") === "todo" ? "todo" : "doing"
  )));
  const mastery = calculateMasteryProgress(day.passCriteria.map((criterion) => (
    dayProgress?.passCriteria[criterion.id] ?? false
  )));
  const completedRequirements = resourceSummary.passed
    + softwareSummary.passed
    + practiceSummary.passed
    + buildSummary.passed
    + mastery.completed;
  const totalRequirements = resourceSummary.total
    + softwareSummary.total
    + practiceSummary.total
    + buildSummary.total
    + mastery.total;
  const hasActivity = day.learn.some((resource) => {
    const progress = dayProgress?.resourceStates[resource.id];
    return progress?.resourceOpened || progress?.resourceCompleted;
  }) || (day.softwareRequirements ?? []).some((software) => (
    (dayProgress?.softwareStates[software.id]?.status ?? "todo") !== "todo"
  )) || [...day.practice, ...day.build].some((task) => (
    (dayProgress?.taskStates[task.id]?.status ?? "todo") !== "todo"
  )) || day.build.some((task) => (
    dayProgress?.buildVerifications[task.id]?.simulationSuccess ?? false
  )) || day.passCriteria.some((criterion) => (
    dayProgress?.passCriteria[criterion.id] ?? false
  ));

  return {
    complete: totalRequirements > 0 && completedRequirements === totalRequirements,
    hasActivity,
    completedRequirements,
    totalRequirements,
    percentage: totalRequirements === 0
      ? 0
      : Math.floor((completedRequirements / totalRequirements) * 100),
    requiredResources: resourceSummary,
    requiredSoftware: softwareSummary,
    practice: practiceSummary,
    build: buildSummary,
    mastery,
  };
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
  const completion = calculateDayCompletion(day, progress.days[day.id]);

  return {
    dayId: day.id,
    dayNumber: day.day,
    title: day.title,
    tasks,
    mastery,
    studyMinutes: calculateStudyTimeTotal(getStudyTime(day, progress)),
    status: completion.complete ? "pass" : "in_progress",
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
