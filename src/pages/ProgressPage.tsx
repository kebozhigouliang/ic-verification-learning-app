import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageIntro } from "@/components/ui/PageIntro";
import { weeks } from "@/data/weeks";
import type { LearningProgress, StudyCategory } from "@/types/progress";
import {
  calculateWeeklyProgress,
  progressTaskCategories,
  type MasteryProgressSummary,
  type TaskProgressSummary,
} from "@/utils/progress";

interface ProgressPageProps {
  progress: LearningProgress;
}

function positionCode(week: number, day: number): string {
  return `W${String(week).padStart(2, "0")} / D${String(day).padStart(2, "0")}`;
}

function categoryLabel(category: StudyCategory): string {
  return category.toUpperCase();
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
  const week = weeks[1];

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
        code="PROGRESS / READ ONLY"
        title="学习进度"
        description="实时汇总任务、掌握标准、Coding 与学习时间。统计结果不会写入本地数据。"
      />

      <section className="progress-position" aria-label="Current learning position">
        <div>
          <span>CURRENT POSITION</span>
          <strong>{positionCode(progress.currentWeek, progress.currentDay)}</strong>
        </div>
        <div>
          <span>WEEK 01</span>
          <strong>{week.title}</strong>
        </div>
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
