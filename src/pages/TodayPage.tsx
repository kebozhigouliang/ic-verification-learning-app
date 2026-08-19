import { AppShell } from "@/components/layout/AppShell";
import { Section } from "@/components/ui/Section";
import type { LearningDay } from "@/types/learning";
import type { TaskStatus } from "@/types/progress";
import { calculateTaskProgress } from "@/utils/progress";

interface TodayPageProps {
  day: LearningDay;
  getTaskStatus: (taskId: string) => TaskStatus;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
}

function formatCode(prefix: string, value: number) {
  return `${prefix}${String(value).padStart(2, "0")}`;
}

const taskStatusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "TODO" },
  { value: "doing", label: "DOING" },
  { value: "pass", label: "PASS" },
];

interface TaskStatusSelectProps {
  taskTitle: string;
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

function TaskStatusSelect({ taskTitle, value, onChange }: TaskStatusSelectProps) {
  return (
    <select
      aria-label={`${taskTitle} status`}
      className={`task-status-select status-${value}`}
      onChange={(event) => onChange(event.target.value as TaskStatus)}
      value={value}
    >
      {taskStatusOptions.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export function TodayPage({
  day,
  getTaskStatus,
  updateTaskStatus,
  onPreviousDay,
  onNextDay,
}: TodayPageProps) {
  const stageCode = formatCode("STAGE ", day.stage.number);
  const weekCode = formatCode("W", day.week);
  const dayCode = formatCode("D", day.day);
  const estimatedTime = day.estimatedMinutes === undefined
    ? "NOT SET"
    : `${day.estimatedMinutes} MIN`;

  const taskIds = [
    ...day.learn,
    ...day.practice,
    ...day.build,
    ...day.debug,
  ].map((task) => task.id);
  const taskProgress = calculateTaskProgress(taskIds.map(getTaskStatus));
  const dayStatus: TaskStatus = taskProgress.total > 0 && taskProgress.passed === taskProgress.total
    ? "pass"
    : taskIds.some((taskId) => getTaskStatus(taskId) !== "todo")
      ? "doing"
      : "todo";

  return (
    <AppShell activePage="today">
      <header className="page-header">
        <div>
          <p className="eyebrow">{stageCode} · {day.stage.title.toUpperCase()}</p>
          <p className="day-code">{weekCode} / {dayCode}</p>
          <h1>{day.title}</h1>
        </div>
        <span className={`status-badge status-${dayStatus}`}>{dayStatus.toUpperCase()}</span>
      </header>
      <nav className="day-navigation" aria-label="学习日切换">
        <button disabled={!onPreviousDay} onClick={onPreviousDay} type="button">← PREVIOUS DAY</button>
        <span>{weekCode} / {dayCode}</span>
        <button disabled={!onNextDay} onClick={onNextDay} type="button">NEXT DAY →</button>
      </nav>
      <section className="summary-panel" aria-label="今日学习概览">
        <div><span>ESTIMATED</span><strong>{estimatedTime}</strong></div>
        <div><span>TASK PROGRESS</span><strong>{taskProgress.passed} / {taskProgress.total} · {taskProgress.percentage}%</strong></div>
        <div className="progress-track" aria-label={`今日进度 ${taskProgress.percentage}%`}><span style={{ width: `${taskProgress.percentage}%` }} /></div>
      </section>
      <Section title="LEARN" count={day.topics.length + day.learn.length}>
        <div className="learning-group">
          <h2 className="learning-group-title">LEARNING TOPICS</h2>
          <ul className="topic-list">
            {day.topics.map((topic) => <li key={topic}>{topic}</li>)}
          </ul>
        </div>
        <div className="learning-group">
          <h2 className="learning-group-title">RESOURCES</h2>
          {day.learn.length > 0 ? day.learn.map((item) => (
            <article className="learning-row" key={item.id}>
              <div><span className="item-type">{item.type.toUpperCase()}</span><h2>{item.title}</h2><p>{item.scope}</p></div>
              <div className="task-actions">
                <span className="time-label">{item.estimatedMinutes === undefined ? "-- MIN" : `${item.estimatedMinutes} MIN`}</span>
                <TaskStatusSelect taskTitle={item.title} value={getTaskStatus(item.id)} onChange={(status) => updateTaskStatus(item.id, status)} />
              </div>
            </article>
          )) : <p className="empty-resource-note">NO RESOURCES ADDED</p>}
        </div>
      </Section>
      <Section title="PRACTICE" count={day.practice.length}>
        {day.practice.map((item) => (
          <article className="task-row" key={item.id}><span className={`task-marker status-${getTaskStatus(item.id)}`} aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.target ?? "NO DESCRIPTION PROVIDED"}</p></div><TaskStatusSelect taskTitle={item.title} value={getTaskStatus(item.id)} onChange={(status) => updateTaskStatus(item.id, status)} /></article>
        ))}
        {day.practice.length === 0 ? <p className="empty-resource-note">NO TASKS</p> : null}
      </Section>
      <Section title="BUILD" count={day.build.length}>
        {day.build.map((item) => (
          <article className="task-row" key={item.id}><span className={`task-marker status-${getTaskStatus(item.id)}`} aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.deliverables.join(" · ")}</p></div><TaskStatusSelect taskTitle={item.title} value={getTaskStatus(item.id)} onChange={(status) => updateTaskStatus(item.id, status)} /></article>
        ))}
        {day.build.length === 0 ? <p className="empty-resource-note">NO TASKS</p> : null}
      </Section>
      <Section title="DEBUG" count={day.debug.length}>
        {day.debug.map((item) => (
          <article className="task-row" key={item.id}><span className={`task-marker status-${getTaskStatus(item.id)}`} aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.prompt}</p><p className="expected-outcome">EXPECTED: {item.expectedOutcome}</p></div><TaskStatusSelect taskTitle={item.title} value={getTaskStatus(item.id)} onChange={(status) => updateTaskStatus(item.id, status)} /></article>
        ))}
        {day.debug.length === 0 ? <p className="empty-resource-note">NO TASKS</p> : null}
      </Section>
      <Section title="PASS CRITERIA" count={day.passCriteria.length}>
        {day.passCriteria.map((item) => (
          <article className="task-row criterion-row" key={item.id}><span className="task-marker" aria-hidden="true" /><h2>{item.label}</h2></article>
        ))}
      </Section>
      <p className="scope-note">MILESTONE 2.1 · SESSION TASK STATUS</p>
    </AppShell>
  );
}
