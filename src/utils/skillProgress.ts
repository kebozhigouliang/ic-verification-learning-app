import type { LearningWeek } from "@/types/learning";
import type { Project } from "@/types/project";
import type { LearningProgress } from "@/types/progress";
import type { LearningStage } from "@/types/roadmap";
import type { Skill, SkillProgress } from "@/types/skill";

interface SkillProgressData {
  learningProgress: LearningProgress;
  projects: readonly Project[];
  roadmap: readonly LearningStage[];
  weeks: Readonly<Record<number, LearningWeek>>;
}

interface CompletionCount {
  completed: number;
  total: number;
}

function percentage({ completed, total }: CompletionCount): number {
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function calculateLearningEvidence(
  relatedIds: ReadonlySet<string>,
  data: SkillProgressData,
): { mastery: CompletionCount; tasks: CompletionCount } {
  const taskKeys = new Set<string>();
  const criterionKeys = new Set<string>();
  const tasks: CompletionCount = { completed: 0, total: 0 };
  const mastery: CompletionCount = { completed: 0, total: 0 };

  const addTask = (dayId: string, taskId: string) => {
    const key = `${dayId}:${taskId}`;
    if (taskKeys.has(key)) return;
    taskKeys.add(key);
    tasks.total += 1;
    if (data.learningProgress.days[dayId]?.taskStates[taskId]?.status === "pass") {
      tasks.completed += 1;
    }
  };

  const addCriterion = (dayId: string, criterionId: string) => {
    const key = `${dayId}:${criterionId}`;
    if (criterionKeys.has(key)) return;
    criterionKeys.add(key);
    mastery.total += 1;
    if (data.learningProgress.days[dayId]?.passCriteria[criterionId] === true) {
      mastery.completed += 1;
    }
  };

  Object.values(data.weeks).forEach((week) => {
    week.days.forEach((day) => {
      const stageId = `stage${String(day.stage.number).padStart(2, "0")}`;
      const includeDay = relatedIds.has(stageId)
        || relatedIds.has(week.id)
        || relatedIds.has(day.id);
      const dayTasks = [...day.learn, ...day.practice, ...day.build, ...day.debug];

      dayTasks.forEach((task) => {
        if (includeDay || relatedIds.has(task.id)) addTask(day.id, task.id);
      });
      day.passCriteria.forEach((criterion) => {
        if (includeDay || relatedIds.has(criterion.id)) addCriterion(day.id, criterion.id);
      });
    });
  });

  data.roadmap.forEach((stage) => {
    stage.weeks.forEach((week) => {
      week.days.forEach((day) => {
        const includeDay = relatedIds.has(stage.id)
          || relatedIds.has(week.id)
          || relatedIds.has(day.id);

        day.tasks.forEach((task) => {
          if (includeDay || relatedIds.has(task.id)) addTask(day.id, task.id);
        });
        day.passCriteria.forEach((criterion) => {
          if (includeDay || relatedIds.has(criterion.id)) addCriterion(day.id, criterion.id);
        });
      });
    });
  });

  return { mastery, tasks };
}

export function calculateSkillProgress(
  skill: Skill,
  data: SkillProgressData,
): SkillProgress {
  const relatedIds = new Set(skill.relatedRoadmapIds);
  const { mastery, tasks } = calculateLearningEvidence(relatedIds, data);
  const relatedProjects = data.projects.filter((project) => (
    skill.relatedProjectIds.includes(project.id)
  ));
  const projectCompletion = relatedProjects.length === 0
    ? 0
    : Math.round(relatedProjects.reduce((total, project) => (
      total + (project.status === "done" ? 100 : clampProgress(project.progress))
    ), 0) / relatedProjects.length);

  const sourceCompletions: number[] = [];
  const evidence: string[] = [];

  if (tasks.total > 0) {
    sourceCompletions.push(percentage(tasks));
    evidence.push(`Roadmap tasks: ${tasks.completed}/${tasks.total}`);
  }
  if (relatedProjects.length > 0) {
    sourceCompletions.push(projectCompletion);
    evidence.push(`Projects: ${projectCompletion}%`);
  }
  if (mastery.total > 0) {
    sourceCompletions.push(percentage(mastery));
    evidence.push(`Mastery: ${mastery.completed}/${mastery.total}`);
  }

  const completion = sourceCompletions.length === 0
    ? 0
    : Math.round(
      sourceCompletions.reduce((total, value) => total + value, 0)
      / sourceCompletions.length,
    );

  return {
    skillId: skill.id,
    completion,
    evidence,
  };
}
