import type { InterviewProgress, UserAnswerStatus } from "@/types/interview";
import type { LearningWeek } from "@/types/learning";
import type { Project } from "@/types/project";
import type { ProjectRecord } from "@/types/projects";
import type { LearningProgress } from "@/types/progress";
import type { LearningStage } from "@/types/roadmap";
import type { Skill, SkillProgress } from "@/types/skill";
import type { StudySession } from "@/types/study-session";
import { calculateDayCompletion, calculateStudyTimeTotal } from "@/utils/progress";
import { calculateSkillProgress } from "@/utils/skillProgress";

interface DashboardInput {
  interviewProgress: InterviewProgress;
  interviewQuestions: readonly { id: string }[];
  learningProgress: LearningProgress;
  learningProjects: readonly Project[];
  projectRecords: readonly ProjectRecord[];
  roadmap: readonly LearningStage[];
  skills: readonly Skill[];
  studySessions: readonly StudySession[];
  weeks: Readonly<Record<number, LearningWeek>>;
}

export interface DashboardLearningStatus {
  currentStage: {
    id?: string;
    number: number;
    title: string;
  };
  currentWeek: {
    id: string;
    number: number;
    title: string;
  };
  overallCompletion: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface DashboardProjectSummary {
  active: number;
  completed: number;
  todo: number;
  total: number;
}

export type DashboardInterviewSummary = Record<UserAnswerStatus, number> & {
  total: number;
};

export interface DashboardStudySummary {
  recentSessions: StudySession[];
  sessionCount: number;
  totalMinutes: number;
}

export interface DashboardSummary {
  interview: DashboardInterviewSummary;
  learning: DashboardLearningStatus;
  projects: DashboardProjectSummary;
  skills: Array<{ skill: Skill; progress: SkillProgress }>;
  study: DashboardStudySummary;
}

function percentage(completed: number, total: number): number {
  return total === 0 ? 0 : Math.floor((completed / total) * 100);
}

export function calculateLearningStatus(
  roadmap: readonly LearningStage[],
  weeks: Readonly<Record<number, LearningWeek>>,
  progress: LearningProgress,
): DashboardLearningStatus {
  const weekId = `week${String(progress.currentWeek).padStart(2, "0")}`;
  const stageIndex = roadmap.findIndex((stage) => (
    stage.weeks.some((week) => week.id === weekId)
  ));
  const stage = stageIndex >= 0 ? roadmap[stageIndex] : undefined;
  const roadmapWeek = stage?.weeks.find((week) => week.id === weekId);

  const completion = Object.values(weeks).reduce((summary, week) => {
    week.days.forEach((day) => {
      const dayCompletion = calculateDayCompletion(day, progress.days[day.id]);
      summary.completed += dayCompletion.completedRequirements;
      summary.total += dayCompletion.totalRequirements;
    });
    return summary;
  }, { completed: 0, total: 0 });

  return {
    currentStage: {
      id: stage?.id,
      number: stageIndex >= 0 ? stageIndex + 1 : 0,
      title: stage?.title ?? "Stage not found",
    },
    currentWeek: {
      id: weekId,
      number: progress.currentWeek,
      title: roadmapWeek?.title ?? weeks[progress.currentWeek]?.title ?? "Week not found",
    },
    overallCompletion: {
      ...completion,
      percentage: percentage(completion.completed, completion.total),
    },
  };
}

export function calculateSkillProgressSummary(
  skills: readonly Skill[],
  data: Pick<DashboardInput, "learningProgress" | "learningProjects" | "roadmap" | "weeks">,
): DashboardSummary["skills"] {
  return skills.map((skill) => ({
    skill,
    progress: calculateSkillProgress(skill, {
      learningProgress: data.learningProgress,
      projects: data.learningProjects,
      roadmap: data.roadmap,
      weeks: data.weeks,
    }),
  }));
}

export function calculateProjectSummary(
  projects: readonly ProjectRecord[],
): DashboardProjectSummary {
  const completed = projects.filter((project) => project.status === "completed").length;
  const todo = projects.filter((project) => project.status === "not_started").length;
  return {
    active: projects.length - completed - todo,
    completed,
    todo,
    total: projects.length,
  };
}

export function calculateInterviewSummary(
  questions: readonly { id: string }[],
  progress: InterviewProgress,
): DashboardInterviewSummary {
  const summary: DashboardInterviewSummary = {
    TODO: 0,
    LEARNING: 0,
    MASTERED: 0,
    total: questions.length,
  };

  questions.forEach((question) => {
    const status = progress[question.id]?.status ?? "TODO";
    summary[status] += 1;
  });
  return summary;
}

export function calculateStudySummary(
  progress: LearningProgress,
  sessions: readonly StudySession[],
  recentLimit = 5,
): DashboardStudySummary {
  const totalMinutes = Object.values(progress.days).reduce((total, day) => (
    total + calculateStudyTimeTotal(day.studyTime)
  ), 0);
  const sortedSessions = [...sessions].sort((a, b) => (
    Date.parse(b.endTime) - Date.parse(a.endTime)
  ));

  return {
    recentSessions: sortedSessions.slice(0, Math.max(0, recentLimit)),
    sessionCount: sessions.length,
    totalMinutes,
  };
}

export function calculateDashboard(input: DashboardInput): DashboardSummary {
  return {
    learning: calculateLearningStatus(input.roadmap, input.weeks, input.learningProgress),
    skills: calculateSkillProgressSummary(input.skills, input),
    projects: calculateProjectSummary(input.projectRecords),
    interview: calculateInterviewSummary(input.interviewQuestions, input.interviewProgress),
    study: calculateStudySummary(input.learningProgress, input.studySessions),
  };
}
