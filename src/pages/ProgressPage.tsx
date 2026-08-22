import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageIntro } from "@/components/ui/PageIntro";
import { interviewQuestions } from "@/data/interview";
import { projects as learningProjects } from "@/data/projects";
import { learningRoadmap } from "@/data/roadmap";
import { skills } from "@/data/skills";
import { weeks } from "@/data/weeks";
import { useInterviewProgress } from "@/hooks/useInterviewProgress";
import { useProjects } from "@/hooks/useProjects";
import { getSessions } from "@/storage/studySessionRepository";
import type { LearningProgress, StudyCategory } from "@/types/progress";
import { calculateDashboard } from "@/utils/dashboard";
import {
  calculateWeeklyProgress,
  progressTaskCategories,
  type MasteryProgressSummary,
  type TaskProgressSummary,
} from "@/utils/progress";
import { generateLearningRecommendations } from "@/utils/recommendation";

interface ProgressPageProps {
  progress: LearningProgress;
}

function categoryLabel(category: StudyCategory): string {
  return category.toUpperCase();
}

function formatSessionDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} SEC`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds === 0 ? `${minutes} MIN` : `${minutes}M ${remainingSeconds}S`;
}

function skillProgressLevel(completion: number): "foundation" | "developing" | "ready" {
  if (completion >= 80) return "ready";
  if (completion >= 40) return "developing";
  return "foundation";
}

function ProgressBar({ percentage, tone = "accent" }: { percentage: number; tone?: "accent" | "blue" }) {
  return (
    <div
      aria-label={`${percentage}% complete`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={percentage}
      className={`progress-track${tone === "blue" ? " blue" : ""}`}
      role="progressbar"
    >
      <span style={{ width: `${percentage}%` }} />
    </div>
  );
}

function TaskCount({ summary }: { summary: TaskProgressSummary }) {
  return <strong>{summary.passed} / {summary.total}</strong>;
}

function MasteryCount({ summary }: { summary: MasteryProgressSummary }) {
  return <strong>{summary.completed} / {summary.total}</strong>;
}

export function ProgressPage({ progress }: ProgressPageProps) {
  const { answers } = useInterviewProgress();
  const { projects: projectRecords } = useProjects();
  const [studySessions] = useState(getSessions);
  const [recommendationNow] = useState(() => new Date().toISOString());
  const week = weeks[1];
  const dashboard = useMemo(() => calculateDashboard({
    interviewProgress: answers,
    interviewQuestions,
    learningProgress: progress,
    learningProjects,
    projectRecords,
    roadmap: learningRoadmap,
    skills,
    studySessions,
    weeks,
  }), [answers, progress, projectRecords, studySessions]);
  const recommendations = useMemo(() => generateLearningRecommendations({
    interview: dashboard.interview,
    learning: dashboard.learning,
    now: recommendationNow,
    projects: projectRecords,
    skills: dashboard.skills,
    studySessions,
  }), [dashboard, projectRecords, recommendationNow, studySessions]);

  if (!week) {
    return (
      <AppShell activePage="progress">
        <EmptyState
          code="DATA NOT FOUND"
          title="无法加载 Week 1 数据"
          description="请检查 Week 数据注册。"
          readOnlyNote="Progress 始终只读。"
        />
      </AppShell>
    );
  }

  const summary = calculateWeeklyProgress(week, progress);

  return (
    <AppShell activePage="progress">
      <PageIntro
        code="ENGINEER GROWTH / READ ONLY"
        title="IC Verification Learning Dashboard"
        description="实时汇总课程、技能、项目、面试与学习投入。所有统计均由现有数据计算，不会写入本地数据。"
      />

      <section className="progress-section dashboard-status" aria-labelledby="dashboard-status-title">
        <header className="progress-section-header">
          <div>
            <span>CURRENT LEARNING STATUS</span>
            <h2 id="dashboard-status-title">成长位置</h2>
          </div>
          <div className="progress-header-metric">
            <strong>{dashboard.learning.overallCompletion.percentage}%</strong>
            <span>OVERALL COMPLETION</span>
          </div>
        </header>
        <div className="dashboard-status-grid">
          <article className="current-stage">
            <span>STAGE {String(dashboard.learning.currentStage.number).padStart(2, "0")}</span>
            <strong>{dashboard.learning.currentStage.title}</strong>
          </article>
          <article>
            <span>WEEK {String(dashboard.learning.currentWeek.number).padStart(2, "0")}</span>
            <strong>{dashboard.learning.currentWeek.title}</strong>
            <small>DAY {String(progress.currentDay).padStart(2, "0")}</small>
          </article>
          <article>
            <span>TRACKED REQUIREMENTS</span>
            <strong>
              {dashboard.learning.overallCompletion.completed}
              {" / "}
              {dashboard.learning.overallCompletion.total}
            </strong>
            <small>{dashboard.learning.overallCompletion.percentage}% COMPLETE</small>
          </article>
        </div>
        <ProgressBar percentage={dashboard.learning.overallCompletion.percentage} />
      </section>

      <section className="progress-section dashboard-recommendations" aria-labelledby="dashboard-recommendations-title">
        <header className="progress-section-header">
          <div>
            <span>LEARNING INTELLIGENCE</span>
            <h2 id="dashboard-recommendations-title">Next Recommended Learning Action</h2>
          </div>
          <div className="progress-header-metric">
            <strong>{recommendations.length}</strong>
            <span>RULE-BASED ACTIONS</span>
          </div>
        </header>
        <div className="dashboard-recommendation-list">
          {recommendations.map((recommendation, index) => (
            <article className={index === 0 ? "primary" : undefined} key={`${recommendation.type}-${recommendation.title}`}>
              <header>
                <div>
                  <span>{index === 0 ? "NEXT ACTION" : recommendation.type}</span>
                  <h3>{recommendation.title}</h3>
                </div>
                <strong className={`recommendation-priority priority-${recommendation.priority.toLowerCase()}`}>
                  {recommendation.priority}
                </strong>
              </header>
              <p>{recommendation.reason}</p>
              <footer>
                <span>{recommendation.type}</span>
                {recommendation.relatedSkillId && <code>{recommendation.relatedSkillId}</code>}
                {recommendation.relatedProjectId && <code>{recommendation.relatedProjectId}</code>}
                {recommendation.relatedRoadmapId && <code>{recommendation.relatedRoadmapId}</code>}
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="progress-section" aria-labelledby="dashboard-skills-title">
        <header className="progress-section-header">
          <div>
            <span>SKILL OVERVIEW</span>
            <h2 id="dashboard-skills-title">能力成长</h2>
          </div>
          <div className="progress-header-metric">
            <strong>{dashboard.skills.length}</strong>
            <span>TRACKED SKILLS</span>
          </div>
        </header>
        <div className="dashboard-skill-list">
          {dashboard.skills.map(({ skill, progress: skillProgress }) => (
            <article
              className={`dashboard-skill-card skill-${skillProgressLevel(skillProgress.completion)}`}
              key={skill.id}
            >
              <div>
                <span>{skill.category.toUpperCase()}</span>
                <strong>{skill.name}</strong>
                <em>{skillProgress.completion}%</em>
              </div>
              <ProgressBar percentage={skillProgress.completion} />
            </article>
          ))}
        </div>
      </section>

      <div className="progress-summary-pair dashboard-overview-pair">
        <section className="progress-section compact" aria-labelledby="dashboard-projects-title">
          <header className="progress-section-header">
            <div>
              <span>PROJECT OVERVIEW</span>
              <h2 id="dashboard-projects-title">工程项目</h2>
            </div>
            <div className="progress-header-metric">
              <strong>{dashboard.projects.total}</strong>
              <span>TOTAL</span>
            </div>
          </header>
          <dl className="dashboard-count-list">
            <div><dt>COMPLETED</dt><dd>{dashboard.projects.completed}</dd></div>
            <div><dt>ACTIVE</dt><dd>{dashboard.projects.active}</dd></div>
            <div><dt>TODO</dt><dd>{dashboard.projects.todo}</dd></div>
          </dl>
        </section>

        <section className="progress-section compact" aria-labelledby="dashboard-interview-title">
          <header className="progress-section-header">
            <div>
              <span>INTERVIEW OVERVIEW</span>
              <h2 id="dashboard-interview-title">面试准备</h2>
            </div>
            <div className="progress-header-metric">
              <strong>{dashboard.interview.total}</strong>
              <span>QUESTIONS</span>
            </div>
          </header>
          <dl className="dashboard-count-list">
            <div><dt>TODO</dt><dd>{dashboard.interview.TODO}</dd></div>
            <div><dt>LEARNING</dt><dd>{dashboard.interview.LEARNING}</dd></div>
            <div><dt>MASTERED</dt><dd>{dashboard.interview.MASTERED}</dd></div>
          </dl>
        </section>
      </div>

      <section className="progress-section" aria-labelledby="dashboard-study-title">
        <header className="progress-section-header">
          <div>
            <span>STUDY SUMMARY</span>
            <h2 id="dashboard-study-title">学习投入</h2>
          </div>
          <div className="progress-header-metric">
            <strong>{dashboard.study.totalMinutes} MIN</strong>
            <span>{dashboard.study.sessionCount} SAVED SESSIONS</span>
          </div>
        </header>
        {dashboard.study.recentSessions.length > 0 ? (
          <div className="dashboard-session-list">
            {dashboard.study.recentSessions.map((session) => (
              <article key={session.id}>
                <div>
                  <span>{session.date}</span>
                  <strong>{session.type}</strong>
                </div>
                <div>
                  <small>{session.relatedDayId ?? "GENERAL STUDY"}</small>
                  <strong>{formatSessionDuration(session.duration)}</strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="dashboard-empty-note">NO STUDY SESSIONS RECORDED YET</p>
        )}
      </section>

      <section className="progress-section" aria-labelledby="week-progress-title">
        <header className="progress-section-header">
          <div>
            <span>WEEK 01</span>
            <h2 id="week-progress-title">每日完成情况</h2>
          </div>
          <div className="progress-header-metric">
            <strong>{summary.weekCompletion.passed} / {summary.weekCompletion.total}</strong>
            <span>{summary.weekCompletion.percentage}% DAYS PASS</span>
          </div>
        </header>
        <ProgressBar percentage={summary.weekCompletion.percentage} />
        <div className="week-day-progress-list">
          {summary.days.map((day) => (
            <article className="week-day-progress" key={day.dayId}>
              <header>
                <div>
                  <span>DAY {day.dayNumber}</span>
                  <h3>{day.title}</h3>
                </div>
                <strong className={`day-progress-status ${day.status}`}>
                  {day.status === "pass" ? "PASS" : "IN PROGRESS"}
                </strong>
              </header>
              <div className="day-progress-metrics">
                <div>
                  <span>TASKS</span>
                  <TaskCount summary={day.tasks} />
                  <ProgressBar percentage={day.tasks.percentage} />
                </div>
                <div>
                  <span>MASTERY</span>
                  <MasteryCount summary={day.mastery} />
                  <ProgressBar percentage={day.mastery.percentage} tone="blue" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="progress-section" aria-labelledby="task-progress-title">
        <header className="progress-section-header">
          <div>
            <span>WEEK 01 / TASKS</span>
            <h2 id="task-progress-title">Task Progress</h2>
          </div>
        </header>
        <div className="task-category-summary">
          {progressTaskCategories.map((category) => {
            const categorySummary = summary.tasksByCategory[category];
            return (
              <article key={category}>
                <span>{categoryLabel(category)}</span>
                <div>
                  <TaskCount summary={categorySummary} />
                  <em>{categorySummary.percentage}%</em>
                </div>
                <ProgressBar percentage={categorySummary.percentage} />
              </article>
            );
          })}
        </div>
      </section>

      <div className="progress-summary-pair">
        <section className="progress-section compact" aria-labelledby="mastery-progress-title">
          <header className="progress-section-header">
            <div>
              <span>PASS CRITERIA</span>
              <h2 id="mastery-progress-title">Mastery Progress</h2>
            </div>
          </header>
          <div className="large-progress-metric">
            <MasteryCount summary={summary.mastery} />
            <em>{summary.mastery.percentage}%</em>
          </div>
          <ProgressBar percentage={summary.mastery.percentage} tone="blue" />
        </section>

        <section className="progress-section compact" aria-labelledby="coding-progress-title">
          <header className="progress-section-header">
            <div>
              <span>BUILD TASKS</span>
              <h2 id="coding-progress-title">Coding Progress</h2>
            </div>
          </header>
          <div className="coding-summary">
            <div>
              <span>COMPLETED</span>
              <TaskCount summary={summary.coding.tasks} />
            </div>
            <div>
              <span>HDLBITS</span>
              <strong>{summary.coding.hdlBitsCompleted}</strong>
            </div>
          </div>
          <ProgressBar percentage={summary.coding.tasks.percentage} />
        </section>
      </div>

      <section className="progress-section" aria-labelledby="study-time-title">
        <header className="progress-section-header">
          <div>
            <span>WEEK 01 / MINUTES</span>
            <h2 id="study-time-title">Study Time</h2>
          </div>
          <div className="progress-header-metric">
            <strong>{summary.studyTime.total} MIN</strong>
            <span>TOTAL STUDY TIME</span>
          </div>
        </header>
        <div className="study-category-summary">
          {progressTaskCategories.map((category) => (
            <div key={category}>
              <span>{categoryLabel(category)}</span>
              <strong>{summary.studyTime.byCategory[category]} MIN</strong>
            </div>
          ))}
        </div>
        <div className="daily-study-time-list">
          {summary.studyTime.byDay.map((day) => (
            <div key={day.dayId}>
              <span>DAY {day.dayNumber}</span>
              <strong>{day.minutes} MIN</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="progress-section" aria-labelledby="recent-days-title">
        <header className="progress-section-header">
          <div>
            <span>LATEST LEARNING DAYS</span>
            <h2 id="recent-days-title">最近 7 天记录</h2>
          </div>
        </header>
        <div className="recent-progress-list">
          {summary.recentDays.map((day) => (
            <article key={day.dayId}>
              <div>
                <span>DAY {day.dayNumber}</span>
                <strong>{day.title}</strong>
              </div>
              <dl>
                <div><dt>TASK</dt><dd>{day.tasks.percentage}%</dd></div>
                <div><dt>MASTERY</dt><dd>{day.mastery.percentage}%</dd></div>
                <div><dt>STUDY</dt><dd>{day.studyMinutes} MIN</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <p className="scope-note">READ ONLY · STUDY TIME CAN ONLY BE EDITED FROM TODAY</p>
    </AppShell>
  );
}
