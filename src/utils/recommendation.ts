import type {
  DashboardInterviewSummary,
  DashboardLearningStatus,
  DashboardSummary,
} from "@/utils/dashboard";
import type { ProjectRecord } from "@/types/projects";
import type { StudySession } from "@/types/study-session";

export type RecommendationType = "SKILL" | "ROADMAP" | "PROJECT" | "INTERVIEW";
export type RecommendationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface LearningRecommendation {
  type: RecommendationType;
  title: string;
  reason: string;
  priority: RecommendationPriority;
  relatedSkillId?: string;
  relatedProjectId?: string;
  relatedRoadmapId?: string;
}

interface RecommendationInput {
  interview: DashboardInterviewSummary;
  learning: DashboardLearningStatus;
  now: string;
  projects: readonly ProjectRecord[];
  skills: DashboardSummary["skills"];
  studySessions: readonly StudySession[];
}

const priorityRank: Record<RecommendationPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

function recentSessionCount(
  sessions: readonly StudySession[],
  now: string,
  days = 7,
): number {
  const currentTime = Date.parse(now);
  if (!Number.isFinite(currentTime)) return 0;
  const earliestTime = currentTime - days * 24 * 60 * 60 * 1000;
  return sessions.filter((session) => {
    const sessionTime = Date.parse(session.endTime);
    return Number.isFinite(sessionTime)
      && sessionTime >= earliestTime
      && sessionTime <= currentTime;
  }).length;
}

export function recommendRoadmapAction(
  learning: DashboardLearningStatus,
  sessions: readonly StudySession[],
  now: string,
): LearningRecommendation | undefined {
  if (learning.overallCompletion.percentage >= 100) return undefined;
  const recentSessions = recentSessionCount(sessions, now);
  const needsRestart = recentSessions === 0;

  return {
    type: "ROADMAP",
    title: `继续 Week ${String(learning.currentWeek.number).padStart(2, "0")}：${learning.currentWeek.title}`,
    reason: needsRestart
      ? `当前已完成 ${learning.overallCompletion.completed}/${learning.overallCompletion.total} 项要求，最近 7 天没有学习 Session，建议先恢复当前 Week 的执行节奏。`
      : `当前已完成 ${learning.overallCompletion.completed}/${learning.overallCompletion.total} 项要求，最近 7 天记录了 ${recentSessions} 个学习 Session，继续完成当前 Week 的未完成项。`,
    priority: needsRestart || learning.overallCompletion.percentage < 50 ? "HIGH" : "MEDIUM",
    relatedRoadmapId: learning.currentWeek.id,
  };
}

export function recommendSkillAction(
  skills: DashboardSummary["skills"],
): LearningRecommendation | undefined {
  const weakestSkill = [...skills]
    .filter(({ progress }) => progress.completion < 100)
    .sort((a, b) => (
      a.progress.completion - b.progress.completion
      || a.skill.name.localeCompare(b.skill.name)
    ))[0];
  if (!weakestSkill) return undefined;

  const completion = weakestSkill.progress.completion;
  return {
    type: "SKILL",
    title: `补强 ${weakestSkill.skill.name}`,
    reason: `${weakestSkill.skill.name} 当前完成度为 ${completion}%，是尚未完成技能中进度最低的一项。优先完成它关联的 Roadmap 任务、Mastery 或项目证据。`,
    priority: completion <= 25 ? "HIGH" : completion <= 60 ? "MEDIUM" : "LOW",
    relatedSkillId: weakestSkill.skill.id,
    relatedRoadmapId: weakestSkill.skill.relatedRoadmapIds[0],
  };
}

export function recommendProjectAction(
  projects: readonly ProjectRecord[],
  roadmapCompletion: number,
): LearningRecommendation | undefined {
  const activeProject = projects.find((project) => (
    project.status === "planning"
    || project.status === "in_progress"
    || project.status === "blocked"
  ));
  if (activeProject) {
    const blocked = activeProject.status === "blocked";
    return {
      type: "PROJECT",
      title: blocked ? `解除项目阻塞：${activeProject.name}` : `继续项目：${activeProject.name}`,
      reason: blocked
        ? `项目当前为 BLOCKED。先处理已记录的问题，再恢复工程里程碑。`
        : `项目当前为 ${activeProject.status.replaceAll("_", " ").toUpperCase()}，继续现有项目比同时启动新项目更有利于形成完整工程证据。`,
      priority: blocked ? "HIGH" : "MEDIUM",
      relatedProjectId: activeProject.id,
    };
  }

  const todoProject = projects.find((project) => project.status === "not_started");
  if (!todoProject) return undefined;
  return {
    type: "PROJECT",
    title: `准备项目：${todoProject.name}`,
    reason: `当前没有进行中的项目。选择一个未开始项目，先明确目标、仓库和第一个可交付里程碑。`,
    priority: roadmapCompletion >= 25 ? "MEDIUM" : "LOW",
    relatedProjectId: todoProject.id,
  };
}

export function recommendInterviewAction(
  interview: DashboardInterviewSummary,
  roadmapCompletion: number,
): LearningRecommendation | undefined {
  if (interview.LEARNING > 0) {
    return {
      type: "INTERVIEW",
      title: "完成正在学习的面试题",
      reason: `已有 ${interview.LEARNING} 道题处于 LEARNING。先补全自己的回答并确认理解，再标记为 MASTERED。`,
      priority: "MEDIUM",
    };
  }
  if (interview.TODO > 0) {
    return {
      type: "INTERVIEW",
      title: "开始下一组面试题",
      reason: `题库中还有 ${interview.TODO} 道 TODO。选择与当前 Stage 相关的问题，先独立回答，再对照标准答案。`,
      priority: roadmapCompletion >= 50 ? "MEDIUM" : "LOW",
    };
  }
  return undefined;
}

export function generateLearningRecommendations(
  input: RecommendationInput,
): LearningRecommendation[] {
  const recommendations = [
    recommendRoadmapAction(input.learning, input.studySessions, input.now),
    recommendSkillAction(input.skills),
    recommendProjectAction(input.projects, input.learning.overallCompletion.percentage),
    recommendInterviewAction(input.interview, input.learning.overallCompletion.percentage),
  ].filter((recommendation): recommendation is LearningRecommendation => (
    recommendation !== undefined
  ));

  if (recommendations.length === 0) {
    return [{
      type: "ROADMAP",
      title: "复核已完成的工程证据",
      reason: "当前 Roadmap、技能、项目和面试目标均已完成。复核运行记录、验证报告与项目说明，确保成果可重复和可展示。",
      priority: "LOW",
      relatedRoadmapId: input.learning.currentWeek.id,
    }];
  }

  return recommendations.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
}
